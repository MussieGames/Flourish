/**
 * useBaby — thin wrapper around BabyContext.
 *
 * Previously this hook fetched Firestore directly (one read per screen).
 * Now it reads from the shared BabyProvider (one read for the whole app).
 *
 * The `uid` parameter is kept for backward compatibility but is no longer
 * used for fetching — the Provider handles that at the root layout level.
 */
import { useBabyContext } from '../contexts/BabyContext';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useBaby(_uid?: string | null) {
  return useBabyContext();
}
