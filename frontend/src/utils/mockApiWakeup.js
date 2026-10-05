/**
 * Utility to wake up the Render-hosted Mock Social Media API.
 * Free-tier Render services spin down to sleep after 15 minutes of inactivity.
 * Pinging this URL triggers Render to spin up the container immediately.
 */
import api from "../api/axios";

export const MOCK_API_URL =
  import.meta.env.VITE_MOCK_API_URL || "https://mock-api-1-lmjs.onrender.com";

let _lastPingTime = 0;
const MIN_PING_INTERVAL_MS = 8000; // Throttle duplicate pings to once per 8s

/**
 * Pings the Render mock API directly from the browser to wake it up if sleeping.
 * Also pings backend /api/social/wakeup to wake it up from the backend's cloud network.
 * Safe, non-blocking, and never throws unhandled errors.
 */
export async function wakeUpMockApi(force = false) {
  const now = Date.now();
  if (!force && now - _lastPingTime < MIN_PING_INTERVAL_MS) {
    return true;
  }
  _lastPingTime = now;

  // 1. Direct browser ping to Render mock API URL
  try {
    fetch(`${MOCK_API_URL}/`, {
      method: "GET",
      headers: { Accept: "application/json" },
    }).catch((err) => {
      console.debug("Direct Mock API wake-up ping:", err?.message || err);
    });
  } catch (err) {
    // Non-blocking catch
  }

  // 2. Also trigger backend wake-up ping
  try {
    api.get("/api/social/wakeup").catch(() => {});
  } catch (e) {
    // Non-blocking catch
  }

  return true;
}
