import { readFileSync } from 'node:fs';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

const projectId = 'demo-flourish-mobile-rules';

const testEnv = await initializeTestEnvironment({
  projectId,
  firestore: {
    host: '127.0.0.1',
    port: 8080,
    rules: readFileSync('firestore.rules', 'utf8'),
  },
});

const baby = {
  ownerId: 'parent',
  memberIds: ['parent'],
  name: 'Little one',
  birthDate: null,
  createdAt: null,
  updatedAt: null,
};

const photoMemory = (storagePath) => ({
  babyId: 'babyA',
  authorId: 'parent',
  kind: 'photo',
  title: 'First smile',
  caption: '',
  storagePath,
  takenAt: null,
  createdAt: null,
});

const journalEntry = (storagePath) => ({
  babyId: 'babyA',
  authorId: 'parent',
  body: 'A quiet morning.',
  mood: null,
  tags: [],
  storagePath,
  createdAt: null,
});

try {
  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'babies', 'babyA'), baby);
    await setDoc(doc(db, 'babies', 'victimBaby'), {
      ...baby,
      ownerId: 'victim',
      memberIds: ['victim'],
      name: 'Victim baby',
    });
  });

  const db = testEnv.authenticatedContext('parent').firestore();

  const validPath = 'babies/babyA/memories/parent/first-smile.jpg';
  const crossBabyPath = 'babies/victimBaby/memories/victim/private.jpg';

  await assertSucceeds(
    setDoc(doc(db, 'babies', 'babyA', 'memories', 'valid-photo'), photoMemory(validPath)),
  );

  await assertFails(
    setDoc(doc(db, 'babies', 'babyA', 'memories', 'cross-baby-photo'), photoMemory(crossBabyPath)),
  );

  await assertFails(
    setDoc(doc(db, 'babies', 'babyA', 'memories', 'note-with-media'), {
      ...photoMemory(validPath),
      kind: 'note',
    }),
  );

  await assertFails(
    updateDoc(doc(db, 'babies', 'babyA', 'memories', 'valid-photo'), {
      storagePath: crossBabyPath,
    }),
  );

  await assertSucceeds(
    setDoc(doc(db, 'babies', 'babyA', 'journal', 'valid-entry'), journalEntry(null)),
  );

  await assertFails(
    setDoc(doc(db, 'babies', 'babyA', 'journal', 'cross-baby-entry'), journalEntry(crossBabyPath)),
  );
} finally {
  await testEnv.cleanup();
}
