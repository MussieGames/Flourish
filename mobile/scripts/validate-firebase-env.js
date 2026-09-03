const REQUIRED_FIREBASE_ENV = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

function isMissingOrPlaceholder(value) {
  const normalized = value?.trim() ?? '';
  return !normalized || normalized.includes('REPLACE_WITH');
}

const invalidKeys = REQUIRED_FIREBASE_ENV.filter((key) =>
  isMissingOrPlaceholder(process.env[key]),
);

if (invalidKeys.length > 0) {
  console.error(
    [
      '[Flourish] Firebase client config is missing or still uses placeholders.',
      `Set real values for: ${invalidKeys.join(', ')}`,
      'Configure these in EAS environment variables before creating a build.',
    ].join('\n'),
  );
  process.exit(1);
}

console.log('[Flourish] Firebase client config validated.');
