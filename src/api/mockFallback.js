/**
 * TEMPORARY: mock-data fallback wrapper.
 *
 * Calls the real API; if it fails (backend endpoint missing/down), falls back
 * to provided mock data so the UI still works during development.
 *
 * TO REMOVE once backend is live:
 *   1. grep the codebase for "MOCK_FALLBACK"
 *   2. replace `withMockFallback(() => apiClient.x(...), mockValue)` with
 *      `await apiClient.x(...)`
 *   3. delete this file and the mock data files under src/data/
 */
export async function withMockFallback(apiCall, mockValue, { label = "" } = {}) {
  try {
    return { data: await apiCall(), usedMock: false };
  } catch (err) {
    console.warn(`[MOCK_FALLBACK] ${label} failed, using mock data:`, err);
    return { data: mockValue, usedMock: true };
  }
}

export default withMockFallback;