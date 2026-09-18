/**
 * Verifies the Flourish app Firestore rules, focused on the holes closed in
 * this change. Run against the Firestore emulator.
 */
import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const OWNER = 'owner_uid';
const MEMBER = 'member_uid';
const STRANGER = 'stranger_uid';
const BABY = 'baby1';

let results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function check(name, fn) {
  try {
    await fn();
    record(name, true);
  } catch (e) {
    record(name, false, e.message?.slice(0, 160));
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: 'flourish-app-test',
  firestore: {
    host: '127.0.0.1',
    port: 8080,
    rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
  },
});

// Seed a baby owned by OWNER and shared with MEMBER, bypassing rules.
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'babies', BABY), {
    ownerId: OWNER,
    memberIds: [OWNER, MEMBER],
    name: 'Aria',
    birthDate: '2026-01-01',
  });
  await setDoc(doc(db, 'users', OWNER), {
    uid: OWNER,
    email: 'o@example.com',
    displayName: null,
    plan: 'seedling',
    appLockEnabled: false,
  });
  await setDoc(doc(db, 'babies', BABY, 'journal', 'j1'), {
    babyId: BABY,
    authorId: OWNER,
    body: 'private',
    tags: [],
  });
  await setDoc(doc(db, 'babies', BABY, 'memories', 'm1'), {
    babyId: BABY,
    authorId: OWNER,
    kind: 'photo',
    title: 'First bath',
    caption: '',
  });
});

const owner = testEnv.authenticatedContext(OWNER).firestore();
const member = testEnv.authenticatedContext(MEMBER).firestore();
const stranger = testEnv.authenticatedContext(STRANGER).firestore();
const anon = testEnv.unauthenticatedContext().firestore();

// ── The plan hole ───────────────────────────────────────────────────
await check('plan: owner CANNOT upgrade self to bloom', () =>
  assertFails(updateDoc(doc(owner, 'users', OWNER), { plan: 'bloom' })));

await check('plan: owner CANNOT grant self heirloom', () =>
  assertFails(updateDoc(doc(owner, 'users', OWNER), { plan: 'heirloom' })));

await check('plan: create must be seedling, not bloom', () =>
  assertFails(setDoc(doc(owner, 'users', 'newuser'), {
    uid: 'newuser', email: null, displayName: null, plan: 'bloom',
  })));

await check('users: can still update own displayName', () =>
  assertSucceeds(updateDoc(doc(owner, 'users', OWNER), { displayName: 'Sam' })));

await check('users: CANNOT inject unknown field', () =>
  assertFails(updateDoc(doc(owner, 'users', OWNER), { isAdmin: true })));

await check('users: CANNOT read another user profile', () =>
  assertFails(getDoc(doc(stranger, 'users', OWNER))));

// ── Journal is owner-only ───────────────────────────────────────────
await check('journal: owner CAN read', () =>
  assertSucceeds(getDoc(doc(owner, 'babies', BABY, 'journal', 'j1'))));

await check('journal: invited member CANNOT read', () =>
  assertFails(getDoc(doc(member, 'babies', BABY, 'journal', 'j1'))));

await check('journal: invited member CANNOT write', () =>
  assertFails(setDoc(doc(member, 'babies', BABY, 'journal', 'j2'), {
    babyId: BABY, authorId: MEMBER, body: 'x', tags: [],
  })));

await check('journal: stranger CANNOT read', () =>
  assertFails(getDoc(doc(stranger, 'babies', BABY, 'journal', 'j1'))));

// ── Memories: members share, strangers don't ────────────────────────
await check('memories: invited member CAN read', () =>
  assertSucceeds(getDoc(doc(member, 'babies', BABY, 'memories', 'm1'))));

await check('memories: stranger CANNOT read', () =>
  assertFails(getDoc(doc(stranger, 'babies', BABY, 'memories', 'm1'))));

await check('memories: member CANNOT rewrite authorId', () =>
  assertFails(updateDoc(doc(member, 'babies', BABY, 'memories', 'm1'), {
    authorId: MEMBER,
  })));

await check('memories: CANNOT bloat title past cap on update', () =>
  assertFails(updateDoc(doc(owner, 'babies', BABY, 'memories', 'm1'), {
    title: 'x'.repeat(5000),
  })));

await check('memories: owner CAN still edit caption', () =>
  assertSucceeds(updateDoc(doc(owner, 'babies', BABY, 'memories', 'm1'), {
    caption: 'Splashing',
  })));

// ── Babies ──────────────────────────────────────────────────────────
await check('babies: stranger CANNOT read', () =>
  assertFails(getDoc(doc(stranger, 'babies', BABY))));

await check('babies: member CANNOT rename (owner only)', () =>
  assertFails(updateDoc(doc(member, 'babies', BABY), { name: 'Hacked' })));

await check('babies: owner CANNOT exceed member cap', () =>
  assertFails(updateDoc(doc(owner, 'babies', BABY), {
    memberIds: Array.from({ length: 30 }, (_, i) => `u${i}`).concat(OWNER),
  })));

await check('babies: owner CANNOT reassign ownership', () =>
  assertFails(updateDoc(doc(owner, 'babies', BABY), { ownerId: STRANGER })));

await check('babies: anon CANNOT read', () =>
  assertFails(getDoc(doc(anon, 'babies', BABY))));

await testEnv.cleanup();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length === 0 ? 0 : 1);
