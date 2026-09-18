/**
 * Guards against over-tightening: every write the real client performs must
 * still succeed. Shapes copied from mobile/src/firebase/firestore.ts.
 */
import { readFileSync } from 'node:fs';
import { assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc, collection, doc, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';

const UID = 'parent_uid';
const BABY = 'baby_happy';

let results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name} — ${e.message?.slice(0, 200)}`);
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: 'flourish-happy-test',
  firestore: {
    host: '127.0.0.1',
    port: 8080,
    rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
  },
});

const db = testEnv.authenticatedContext(UID).firestore();

// ensureUserProfile()
await check('ensureUserProfile create', () =>
  assertSucceeds(setDoc(doc(db, 'users', UID), {
    uid: UID,
    email: 'parent@example.com',
    displayName: null,
    plan: 'seedling',
    appLockEnabled: false,
    createdAt: serverTimestamp(),
  })));

// A legacy doc with no appLockEnabled must still be updatable.
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), 'users', 'legacy_uid'), {
    uid: 'legacy_uid', email: null, displayName: null, plan: 'seedling',
  });
});
const legacy = testEnv.authenticatedContext('legacy_uid').firestore();
await check('legacy user doc (no appLockEnabled) can update displayName', () =>
  assertSucceeds(updateDoc(doc(legacy, 'users', 'legacy_uid'), { displayName: 'Sam' })));

// createBaby()
await check('createBaby', () =>
  assertSucceeds(setDoc(doc(db, 'babies', BABY), {
    ownerId: UID,
    memberIds: [UID],
    name: 'Aria',
    birthDate: '2026-01-01',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));

// createBaby() with a null birthDate
await check('createBaby with null birthDate', () =>
  assertSucceeds(setDoc(doc(db, 'babies', 'baby_nodate'), {
    ownerId: UID,
    memberIds: [UID],
    name: 'Little one',
    birthDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })));

// updateBaby()
await check('updateBaby name + updatedAt', () =>
  assertSucceeds(updateDoc(doc(db, 'babies', BABY), {
    name: 'Aria Rose',
    updatedAt: serverTimestamp(),
  })));

// seedMilestones()
await check('seedMilestones entry', () =>
  assertSucceeds(setDoc(doc(db, 'babies', BABY, 'milestones', 'ms1'), {
    babyId: BABY,
    key: 'first-bath',
    label: 'First bath',
    emoji: '🛁',
    typicalAge: 'Week 1',
    status: 'upcoming',
    authorId: UID,
    createdAt: serverTimestamp(),
  })));

// captureMilestone()
await check('captureMilestone', () =>
  assertSucceeds(updateDoc(doc(db, 'babies', BABY, 'milestones', 'ms1'), {
    status: 'captured',
    capturedAt: serverTimestamp(),
  })));

// addMemory()
await check('addMemory', () =>
  assertSucceeds(addDoc(collection(db, 'babies', BABY, 'memories'), {
    babyId: BABY,
    authorId: UID,
    kind: 'photo',
    title: 'First bath',
    caption: '',
    storagePath: `babies/${BABY}/memories/${UID}/123-abc.jpeg`,
    takenAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })));

// addMemory() with a null storagePath (note-only memory)
await check('addMemory note with null storagePath', () =>
  assertSucceeds(addDoc(collection(db, 'babies', BABY, 'memories'), {
    babyId: BABY,
    authorId: UID,
    kind: 'note',
    title: 'She laughed',
    caption: '',
    storagePath: null,
    takenAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })));

// addJournalEntry()
await check('addJournalEntry', () =>
  assertSucceeds(addDoc(collection(db, 'babies', BABY, 'journal'), {
    babyId: BABY,
    authorId: UID,
    body: 'Today she slept through.',
    mood: '🥰',
    tags: ['sleep'],
    storagePath: null,
    createdAt: serverTimestamp(),
  })));

// addJournalEntry() with a null mood
await check('addJournalEntry with null mood', () =>
  assertSucceeds(addDoc(collection(db, 'babies', BABY, 'journal'), {
    babyId: BABY,
    authorId: UID,
    body: 'Quiet day.',
    mood: null,
    tags: [],
    storagePath: null,
    createdAt: serverTimestamp(),
  })));

// addEvent()
await check('addEvent', () =>
  assertSucceeds(addDoc(collection(db, 'babies', BABY, 'events'), {
    babyId: BABY,
    type: 'appointment',
    title: '6 week check-up',
    meta: 'Dr Patel',
    date: '2026-03-01',
    createdAt: serverTimestamp(),
  })));

await testEnv.cleanup();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length === 0 ? 0 : 1);
