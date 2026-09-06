// Shared refreshes prevent each visitor from multiplying provider traffic.
export function createFeedCache(loader, { intervalMs = 60000, now = Date.now } = {}) {
  let value, updatedAt = null, attemptedAt = null, pending, failures = 0, nextAttempt = 0;
  const status = () => ({ updatedAt, attemptedAt, stale: updatedAt === null || failures > 0 || now() - updatedAt >= intervalMs, failures, nextAttempt });
  async function get() {
    if (pending) return pending;
    if (now() < nextAttempt) {
      if (updatedAt !== null) return value;
      throw new Error('Feed unavailable');
    }
    attemptedAt = now();
    pending = (async () => {
      try {
        const result = await loader();
        if (result == null || result.error) throw new Error('Invalid feed response');
        value = result; updatedAt = now(); failures = 0; nextAttempt = now() + intervalMs;
        return value;
      } catch {
        failures++; nextAttempt = now() + Math.min(intervalMs * 2 ** Math.min(failures, 5), 900000);
        if (updatedAt !== null) return value;
        throw new Error('Feed unavailable');
      } finally { pending = undefined; }
    })();
    return pending;
  }
  return { get, status };
}
