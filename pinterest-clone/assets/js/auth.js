// ========================================
// AUTH HELPERS - Session management
// ========================================

const Auth = {
  STORAGE_KEY: 'pinterest_session',
  REMEMBER_KEY: 'pinterest_remember',

  // Save session
  setSession(user, remember = false) {
    const session = {
      user: { ...user, password: undefined },
      timestamp: Date.now()
    };
    if (remember) {
      localStorage.setItem(this.REMEMBER_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    }
    API.currentUser = user;
  },

  // Get session
  getSession() {
    // Check sessionStorage first (current session)
    let session = sessionStorage.getItem(this.STORAGE_KEY);
    if (session) return JSON.parse(session).user;

    // Fallback to localStorage (remember me)
    session = localStorage.getItem(this.REMEMBER_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      // Auto-expire after 30 days
      if (Date.now() - parsed.timestamp < 30 * 24 * 60 * 60 * 1000) {
        return parsed.user;
      }
      this.clearSession();
    }
    return null;
  },

  // Clear session
  clearSession() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.REMEMBER_KEY);
    API.currentUser = null;
  },

  // Check if logged in
  isLoggedIn() {
    return !!this.getSession();
  },

  // Get current user
  getUser() {
    return this.getSession();
  },

  // Require auth (redirect if not logged in)
  requireAuth(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      window.location.replace(redirectTo);
      return false;
    }
    return true;
  },

  // Redirect if already logged in
  redirectIfLoggedIn(redirectTo = 'index.html') {
    if (this.isLoggedIn()) {
      window.location.replace(redirectTo);
      return true;
    }
    return false;
  }
};

window.Auth = Auth;