const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  persistWaitlistSignup,
  waitlistDocumentId,
} = require("./waitlistPersistence");

const SERVER_TIMESTAMP = Symbol("serverTimestamp");
const admin = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => SERVER_TIMESTAMP,
    },
  },
};

function createFakeDb({ waitlistExists = false, confirmationExists = false } = {}) {
  const writes = [];
  const queries = [];
  let commits = 0;

  const db = {
    collection(name) {
      return {
        doc(id) {
          return { name, id };
        },
        where(field, operator, value) {
          return {
            limit(limitValue) {
              return {
                async get() {
                  queries.push({ name, field, operator, value, limit: limitValue });
                  return {
                    empty: name === "waitlist" ? !waitlistExists : !confirmationExists,
                  };
                },
              };
            },
          };
        },
      };
    },
    batch() {
      return {
        set(ref, data, options) {
          writes.push({ ref, data, options });
        },
        async commit() {
          commits += 1;
        },
      };
    },
  };

  return {
    db,
    writes,
    queries,
    get commits() {
      return commits;
    },
  };
}

async function persistWith(fakeDb, overrides = {}) {
  return persistWaitlistSignup({
    db: fakeDb.db,
    admin,
    normalizedEmail: "parent@example.com",
    page: "hero",
    source: "https://www.goflourish.com.au/",
    userAgent: "test-agent",
    recaptchaScore: 0.9,
    sendgridTemplateId: "template-id",
    ...overrides,
  });
}

test("persists a new signup and confirmation email in one batch", async () => {
  const fakeDb = createFakeDb();

  const result = await persistWith(fakeDb);

  const expectedDocId = waitlistDocumentId("parent@example.com");
  assert.deepEqual(result, {
    waitlistCreated: true,
    confirmationEnqueued: true,
  });
  assert.equal(fakeDb.commits, 1);
  assert.equal(fakeDb.writes.length, 2);
  assert.deepEqual(
    fakeDb.writes.map((write) => ({ ref: write.ref, options: write.options })),
    [
      { ref: { name: "waitlist", id: expectedDocId }, options: { merge: true } },
      { ref: { name: "auto_reply", id: expectedDocId }, options: { merge: true } },
    ]
  );
  assert.equal(fakeDb.writes[0].data.email, "parent@example.com");
  assert.equal(fakeDb.writes[0].data.timestamp, SERVER_TIMESTAMP);
  assert.deepEqual(fakeDb.writes[1].data, {
    to: "parent@example.com",
    template: {
      templateId: "template-id",
      data: {
        email: "parent@example.com",
      },
    },
  });
});

test("retries enqueue confirmation when the waitlist row already exists", async () => {
  const fakeDb = createFakeDb({ waitlistExists: true });

  const result = await persistWith(fakeDb);

  assert.deepEqual(result, {
    waitlistCreated: false,
    confirmationEnqueued: true,
  });
  assert.equal(fakeDb.commits, 1);
  assert.deepEqual(fakeDb.writes.map((write) => write.ref.name), ["auto_reply"]);
  assert.equal(fakeDb.writes[0].data.to, "parent@example.com");
});

test("duplicate retries skip writes after both records exist", async () => {
  const fakeDb = createFakeDb({
    waitlistExists: true,
    confirmationExists: true,
  });

  const result = await persistWith(fakeDb);

  assert.deepEqual(result, {
    waitlistCreated: false,
    confirmationEnqueued: false,
  });
  assert.equal(fakeDb.commits, 0);
  assert.deepEqual(fakeDb.writes, []);
});
