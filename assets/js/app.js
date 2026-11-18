// ========================================
// MAIN APP - Router, State, Components
// ========================================

const App = {
  // State
  state: {
    currentPage: '',
    user: null,
    pins: [],
    pinOffset: 0,
    loading: false,
    hasMore: true,
    searchQuery: '',
    searchType: 'pins',
    modal: null,
    toasts: []
  },

  // DOM cache
  elements: {},

  // Initialize app
  async init() {
    await API.init();
    this.state.user = Auth.getSession();
    if (this.state.user) API.currentUser = this.state.user;

    this.cacheElements();
    this.bindEvents();
    this.renderHeader();
    this.handleRoute();

    // Infinite scroll
    window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 100));
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      header: document.querySelector('.header'),
      main: document.querySelector('main') || document.querySelector('.main'),
      searchInput: document.querySelector('.search-input'),
      logoutBtn: document.getElementById('logoutBtn'),
      profileBtn: document.getElementById('profileBtn'),
      createBtn: document.getElementById('createBtn'),
      mobileMenuBtn: document.getElementById('mobileMenuBtn'),
      mobileMenu: document.getElementById('mobileMenu')
    };
  },

  // Bind global events
  bindEvents() {
    // Search
    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          window.location.href = `search.html?q=${encodeURIComponent(e.target.value.trim())}`;
        }
      });
    }

    // Logout
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener('click', () => this.logout());
    }

    // Mobile menu toggle
    if (this.elements.mobileMenuBtn) {
      this.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (!d.contains(e.target)) d.classList.remove('open');
      });
      this.closeMobileMenu();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeMobileMenu();
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });
  },

  // Handle routing based on current page
  handleRoute() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    this.state.currentPage = path.replace('.html', '');

    // Pages that require auth
    const protectedPages = ['index', 'profile', 'boards', 'board', 'create', 'notifications', 'settings', 'pin'];
    if (protectedPages.includes(this.state.currentPage) && !Auth.isLoggedIn()) {
      window.location.replace('login.html');
      return;
    }

    // Pages that redirect if logged in
    const authPages = ['login', 'signup'];
    if (authPages.includes(this.state.currentPage) && Auth.isLoggedIn()) {
      window.location.replace('index.html');
      return;
    }

    // Initialize page-specific logic (defer to next tick so DOM is ready)
    setTimeout(() => this[this.state.currentPage + 'Init']?.(), 0);
  },

  // Render header based on auth state
  renderHeader() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;

    if (this.state.user) {
      authSection.innerHTML = `
        <button class="btn-icon" id="createBtn" aria-label="Create pin"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        <div class="dropdown" id="profileDropdown">
          <button class="btn-icon avatar" id="profileBtn" aria-label="Profile" aria-expanded="false" aria-haspopup="true">
            <img src="${this.state.user.avatar}" alt="${this.state.user.name}" loading="lazy">
          </button>
          <div class="dropdown-menu" role="menu">
            <a href="profile.html" class="dropdown-item" role="menuitem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile</a>
            <a href="boards.html" class="dropdown-item" role="menuitem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>Boards</a>
            <a href="create.html" class="dropdown-item" role="menuitem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create pin</a>
            <div class="dropdown-divider"></div>
            <a href="settings.html" class="dropdown-item" role="menuitem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
            <button class="dropdown-item danger" id="logoutBtn" role="menuitem"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log out</button>
          </div>
        </div>
        <button class="btn-icon" id="mobileMenuBtn" aria-label="Menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
        <div class="dropdown" id="mobileMenu" style="display:none;">
          <div class="dropdown-menu" style="min-width:280px;right:-100px;">
            <div style="padding:16px;border-bottom:1px solid var(--border);">
              <div style="font-weight:600;">${this.state.user.name}</div>
              <div style="font-size:13px;color:var(--muted);">@${this.state.user.username}</div>
            </div>
            <a href="profile.html" class="dropdown-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profile</a>
            <a href="boards.html" class="dropdown-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>Boards</a>
            <a href="create.html" class="dropdown-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Create pin</a>
            <a href="notifications.html" class="dropdown-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Notifications</a>
            <a href="settings.html" class="dropdown-item"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" id="mobileLogoutBtn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Log out</button>
          </div>
        </div>
      `;
      // Re-bind dropdown events
      this.bindDropdowns();
    } else {
      authSection.innerHTML = `
        <a href="login.html" class="btn-ghost">Log in</a>
        <a href="signup.html" class="btn-primary">Sign up</a>
      `;
    }

    this.cacheElements();
    this.bindEvents();
  },

  // Bind dropdown toggles
  bindDropdowns() {
    document.querySelectorAll('.dropdown > button[aria-haspopup]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = btn.closest('.dropdown');
        dropdown.classList.toggle('open');
        btn.setAttribute('aria-expanded', dropdown.classList.contains('open'));
      });
    });

    // Logout buttons
    document.querySelectorAll('#logoutBtn, #mobileLogoutBtn').forEach(btn => {
      btn.addEventListener('click', () => this.logout());
    });
  },

  // Toggle mobile menu
  toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  },

  closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.style.display = 'none';
  },

  // Logout
  async logout() {
    try {
      // Sign out from Firebase too
      const { signOut, auth } = await import('./firebase-config.js');
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
    Auth.clearSession();
    this.state.user = null;
    window.location.href = 'login.html';
  },

  // Modal management
  openModal(html, options = {}) {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        ${html}
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    this.state.modal = overlay;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Focus trap
    const modal = overlay.querySelector('.modal');
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  },

  closeModal() {
    if (this.state.modal) {
      this.state.modal.classList.remove('open');
      setTimeout(() => this.state.modal?.remove(), 200);
      this.state.modal = null;
    }
  },

  // Toast notifications
  showToast(message, type = 'default') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideIn .3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // Infinite scroll handler
  handleScroll() {
    if (this.state.loading || !this.state.hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 800) {
      this.loadMorePins();
    }
  },

  // Load more pins (override per page)
  async loadMorePins() {
    this.state.loading = true;
    // Implement in page-specific init
    this.state.loading = false;
  },

  // Debounce utility
  debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  // Format numbers (1.2k, 1.5M)
  formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  },

  // Format date (2h, 3d, Jan 15)
  formatDate(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 6e4);
    const hours = Math.floor(diff / 3.6e6);
    const days = Math.floor(diff / 8.64e7);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // Render pin card
  renderPin(pin, options = {}) {
    const { showSave = true, showHover = true, link = true } = options;
    const gradient = pin.gradient || `linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)`;
    const imgHtml = pin.image
      ? `<img class="pin-img" src="${pin.image}" alt="${pin.title}" loading="lazy" decoding="async">`
      : `<div class="pin-img-placeholder" style="background:${gradient}"></div>`;

    const saveBtn = showSave ? `
      <button class="btn-save ${pin.saved ? 'saved' : ''}" data-pin-id="${pin.id}" aria-label="${pin.saved ? 'Unsave' : 'Save'}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="${pin.saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 1 0 7.78l-8 8a5.5 5.5 0 0 1-7.78 0l-8-8a5.5 5.5 0 0 1 0-7.78l8-8a5.5 5.5 0 0 1 7.78 0z"/>
          ${!pin.saved ? '<path d="M12 18l4-4"/>' : ''}
        </svg>
      </button>
    ` : '';

    const hoverActions = showHover ? `
      <div class="pin-hover-actions">
        ${saveBtn}
        <button class="btn-icon" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </div>
    ` : '';

    const card = `
      <article class="pin" data-pin-id="${pin.id}">
        ${link ? `<a href="pin.html?id=${pin.id}" class="pin-link">` : ''}
          <div class="pin-image-wrapper" style="position:relative;">
            ${imgHtml}
            ${hoverActions}
          </div>
          <div class="pin-info">
            <h3 class="pin-title line-clamp-2">${pin.title}</h3>
            <div class="pin-meta">
              <div class="pin-stats">
                <span class="stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 1 0 7.78l-8 8a5.5 5.5 0 0 1-7.78 0l-8-8a5.5 5.5 0 0 1 0-7.78l8-8a5.5 5.5 0 0 1 7.78 0z"/><path d="M12 18l4-4"/></svg>${this.formatNumber(pin.saves)}</span>
                <span class="stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${this.formatNumber(pin.comments)}</span>
              </div>
              ${!showHover ? saveBtn : ''}
            </div>
          </div>
        ${link ? '</a>' : ''}
      </article>
    `;
    return card;
  },

  // Render pin cards into grid
  renderPins(pins, container, append = false) {
    const html = pins.map(p => this.renderPin(p)).join('');
    if (append) {
      container.insertAdjacentHTML('beforeend', html);
    } else {
      container.innerHTML = html;
    }
    // Bind save buttons
    container.querySelectorAll('.btn-save').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSave(btn.dataset.pinId, btn);
      });
    });
  },

  // Toggle pin save
  async toggleSave(pinId, btn) {
    const saved = btn.classList.contains('saved');
    try {
      if (saved) {
        await API.unsavePin(pinId);
        btn.classList.remove('saved');
        btn.querySelector('svg').innerHTML = '<path d="M20.84 4.61a5.5 5.5 0 0 1 0 7.78l-8 8a5.5 5.5 0 0 1-7.78 0l-8-8a5.5 5.5 0 0 1 0-7.78l8-8a5.5 5.5 0 0 1 7.78 0z"/><path d="M12 18l4-4"/>';
        btn.setAttribute('aria-label', 'Save');
      } else {
        await API.savePin(pinId);
        btn.classList.add('saved');
        btn.querySelector('svg').innerHTML = '<path d="M20.84 4.61a5.5 5.5 0 0 1 0 7.78l-8 8a5.5 5.5 0 0 1-7.78 0l-8-8a5.5 5.5 0 0 1 0-7.78l8-8a5.5 5.5 0 0 1 7.78 0z" fill="currentColor"/>';
        btn.setAttribute('aria-label', 'Unsave');
      }
      // Update count
      const stat = btn.closest('.pin').querySelector('.stat');
      if (stat) {
        const currentText = stat.textContent;
        const match = currentText.match(/([\d.]+)([kM]?)/);
        if (match) {
          let val = parseFloat(match[1]);
          if (match[2] === 'k') val *= 1000;
          else if (match[2] === 'M') val *= 1000000;
          val = saved ? Math.max(0, val - 1) : val + 1;
          stat.textContent = currentText.replace(/[\d.]+[kM]?/, this.formatNumber(val));
        }
      }
    } catch (err) {
      this.showToast('Failed to save', 'error');
    }
  },

  // Create board modal
  openCreateBoardModal(onSuccess) {
    this.openModal(`
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title">Create board</h2>
        <button class="modal-close" aria-label="Close"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <form id="createBoardForm">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="boardTitle">Title</label>
            <input type="text" class="form-input" id="boardTitle" name="title" placeholder="Board title" required maxlength="50">
          </div>
          <div class="form-group">
            <label class="form-label" for="boardDesc">Description (optional)</label>
            <textarea class="form-input" id="boardDesc" name="description" rows="3" placeholder="What's this board about?" maxlength="500"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-wrap">
              <input type="checkbox" name="secret" value="1"> Keep this board secret
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn-primary">Create</button>
        </div>
      </form>
    `);
    document.querySelector('.modal-close, [data-close]').addEventListener('click', () => this.closeModal());
    document.getElementById('createBoardForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const submitBtn = form.querySelector('.btn-primary');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      try {
        const board = await API.createBoard({
          title: form.title.value.trim(),
          description: form.description.value.trim(),
          secret: form.secret.checked
        });
        this.showToast('Board created!');
        this.closeModal();
        // Refresh if on boards page
        if (this.state.currentPage === 'boards') this.boardsInit();
        if (onSuccess) onSuccess();
      } catch (err) {
        this.showToast(err.message, 'error');
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  },

  // Render boards
  renderBoards(boards, container) {
    container.innerHTML = boards.map(board => `
      <a href="board.html?id=${board.id}" class="board-card">
        <div class="board-cover">
          ${board.cover ? `<img src="${board.cover}" alt="${board.title}" loading="lazy">` : `<div style="width:100%;height:100%;background:var(--border);"></div>`}
          ${board.secret ? `<span style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,.7);color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;">🔒 Secret</span>` : ''}
        </div>
        <div class="board-info">
          <h3 class="board-title">${board.title}</h3>
          <div class="board-count">${board.pins} pins</div>
        </div>
      </a>
    `).join('');
  }
};

// Global event delegation for dynamic elements
document.addEventListener('click', (e) => {
  // Follow buttons
  if (e.target.closest('.btn-follow')) {
    const btn = e.target.closest('.btn-follow');
    const userId = btn.dataset.userId;
    if (userId) App.toggleFollow(userId, btn);
  }
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;