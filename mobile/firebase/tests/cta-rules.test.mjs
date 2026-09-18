/** Verifies the CTA (marketing) Firestore rules: waitlist is server-only. */
import { readFileSync } from 'node:fs';
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore';

let results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}`);
  } catch (e) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name} — ${e.message?.slice(0, 160)}`);
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: 'flourish-cta-test',
  firestore: {
    host: '127.0.0.1',
    port: 8080,
    rules: readFileSync(new URL('../../../firestore.rules', import.meta.url), 'utf8'),
  },
});

const anon = testEnv.unauthenticatedContext().firestore();
const signedIn = testEnv.authenticatedContext('someone').firestore();

await check('waitlist: anon CANNOT create (reCAPTCHA bypass closed)', () =>
  assertFails(addDoc(collection(anon, 'waitlist'), {
    email: 'bot@example.com',
    source: 'cta-hero',
    page: 'hero section',
    userAgent: 'bot',
  })));

await check('waitlist: signed-in user CANNOT create either', () =>
  assertFails(addDoc(collection(signedIn, 'waitlist'), {
    email: 'bot@example.com',
  })));

await check('waitlist: anon CANNOT read the list', () =>
  assertFails(getDocs(collection(anon, 'waitlist'))));

await check('auto_reply: anon CANNOT write (no mail injection)', () =>
  assertFails(addDoc(collection(anon, 'auto_reply'), {
    to: 'victim@example.com',
    template: { templateId: 'x' },
  })));

await check('mail: anon CANNOT write', () =>
  assertFails(addDoc(collection(anon, 'mail'), { to: 'victim@example.com' })));

await check('arbitrary collection: anon CANNOT read', () =>
  assertFails(getDoc(doc(anon, 'anything', 'x'))));

await testEnv.cleanup();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length === 0 ? 0 : 1);
