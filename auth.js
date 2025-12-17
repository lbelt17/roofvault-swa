// auth.js — RoofVault auth state for Azure Static Web Apps
// Provides: window.getAuthState()
// Uses: /.auth/me  (SWA built-in)

(function () {
  "use strict";

  const AUTH_ME = "/.auth/me";
  const CACHE_MS = 15_000;

  let _cache = null;
  let _cacheAt = 0;

  function normalizeClientPrincipal(cp) {
    const roles = Array.isArray(cp?.userRoles) ? cp.userRoles : [];
    const isAuthenticated = !!cp && roles.length > 0 && !roles.includes("anonymous");

    return {
      isAuthenticated,
      userId: cp?.userId || null,
      userDetails: cp?.userDetails || null,
      identityProvider: cp?.identityProvider || null,
      roles
    };
  }

  async function fetchAuthState() {
    try {
      const res = await fetch(AUTH_ME, { credentials: "include" });

      // If not signed in, SWA can return 401/403 depending on config
      if (!res.ok) {
        return {
          isAuthenticated: false,
          userId: null,
          userDetails: null,
          identityProvider: null,
          roles: ["anonymous"]
        };
      }

      const data = await res.json();
      const cp = data?.clientPrincipal || null;
      return normalizeClientPrincipal(cp);
    } catch (e) {
      // Network / blocked / local dev mismatch — treat as signed out
      return {
        isAuthenticated: false,
        userId: null,
        userDetails: null,
        identityProvider: null,
        roles: ["anonymous"],
        error: e?.message || String(e)
      };
    }
  }

  // ✅ This is what gen-exam.js expects
  window.getAuthState = async function getAuthState(force = false) {
    const now = Date.now();
    if (!force && _cache && now - _cacheAt < CACHE_MS) return _cache;

    _cache = await fetchAuthState();
    _cacheAt = now;

    // Optional: broadcast so pages can react
    try {
      window.dispatchEvent(new CustomEvent("rv:authChanged", { detail: _cache }));
    } catch {}

    return _cache;
  };
})();
