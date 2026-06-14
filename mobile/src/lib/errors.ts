/** Maps Firebase error codes to calm, human, non-leaky messages. */
export function friendlyAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address doesn’t look quite right.';
    case 'auth/email-already-in-use':
      return 'An account already exists for this email. Try signing in.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    // Deliberately identical message for wrong-password / user-not-found /
    // invalid-credential so we never reveal whether an email is registered.
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to complete this action.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function friendlyError(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message: unknown }).message);
    if (message && !message.includes('Firebase:')) return message;
  }
  return fallback;
}
