/**
 * Authentication Module - Admin Login System
 * Handles admin login, session management, and admin user management
 */

const Auth = (function() {
    'use strict';

    // ========================================
    // CONSTANTS & STORAGE KEYS
    // ========================================
    const STORAGE_KEYS = {
        ADMIN_USERS: 'pinterest_admin_users',
        CURRENT_ADMIN: 'pinterest_current_admin',
        USER_PINS: 'pinterest_user_pins',
        ALL_PINS: 'pinterest_all_pins'
    };

    // Default admin user (hardcoded as requested)
    const DEFAULT_ADMIN = {
        username: 'Paru@1523',
        isDefault: true,
        createdAt: new Date().toISOString()
    };

    // ========================================
    // STATE
    // ========================================
    let currentAdmin = null;
    let adminUsers = [];

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        loadAdminUsers();
        loadCurrentSession();
        bindEvents();
        updateUI();
    }

    // ========================================
    // ADMIN USERS MANAGEMENT
    // ========================================
    function loadAdminUsers() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
            if (stored) {
                adminUsers = JSON.parse(stored);
            } else {
                // Initialize with default admin
                adminUsers = [DEFAULT_ADMIN];
                saveAdminUsers();
            }
        } catch (e) {
            console.error('Failed to load admin users:', e);
            adminUsers = [DEFAULT_ADMIN];
        }
    }

    function saveAdminUsers() {
        try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
        } catch (e) {
            console.error('Failed to save admin users:', e);
        }
    }

    function isDefaultAdmin(username) {
        return username === DEFAULT_ADMIN.username;
    }

    function isAdmin(username) {
        return adminUsers.some(admin => admin.username === username);
    }

    function addAdmin(username) {
        if (!username || isAdmin(username)) return false;
        adminUsers.push({
            username,
            isDefault: false,
            createdAt: new Date().toISOString(),
            createdBy: currentAdmin?.username || 'system'
        });
        saveAdminUsers();
        return true;
    }

    function removeAdmin(username) {
        if (isDefaultAdmin(username)) return false; // Cannot remove default admin
        const index = adminUsers.findIndex(a => a.username === username);
        if (index === -1) return false;
        adminUsers.splice(index, 1);
        saveAdminUsers();
        return true;
    }

    function getAdminUsers() {
        return [...adminUsers];
    }

    // ========================================
    // SESSION MANAGEMENT
    // ========================================
    function loadCurrentSession() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_ADMIN);
            if (stored) {
                currentAdmin = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load session:', e);
        }
    }

    function saveSession(admin) {
        try {
            currentAdmin = admin;
            localStorage.setItem(STORAGE_KEYS.CURRENT_ADMIN, JSON.stringify(admin));
        } catch (e) {
            console.error('Failed to save session:', e);
        }
    }

    function clearSession() {
        currentAdmin = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ADMIN);
    }

    // ========================================
    // LOGIN / LOGOUT
    // ========================================
    function login(username) {
        if (!isAdmin(username)) {
            return { success: false, error: 'Invalid admin username' };
        }

        const admin = {
            username,
            isDefault: isDefaultAdmin(username),
            loginTime: new Date().toISOString()
        };

        saveSession(admin);
        updateUI();
        return { success: true, admin };
    }

    function logout() {
        clearSession();
        updateUI();
        return { success: true };
    }

    function getCurrentAdmin() {
        return currentAdmin ? { ...currentAdmin } : null;
    }

    function isLoggedIn() {
        return currentAdmin !== null;
    }

    function isCurrentAdminDefault() {
        return currentAdmin?.isDefault === true;
    }

    // ========================================
    // PIN MANAGEMENT (with ownership)
    // ========================================
    function loadAllPins() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.ALL_PINS);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load pins:', e);
            return [];
        }
    }

    function saveAllPins(pins) {
        try {
            localStorage.setItem(STORAGE_KEYS.ALL_PINS, JSON.stringify(pins));
        } catch (e) {
            console.error('Failed to save pins:', e);
        }
    }

    function loadUserPins(username) {
        try {
            const key = `${STORAGE_KEYS.USER_PINS}_${username}`;
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to load user pins:', e);
            return [];
        }
    }

    function saveUserPins(username, pins) {
        try {
            const key = `${STORAGE_KEYS.USER_PINS}_${username}`;
            localStorage.setItem(key, JSON.stringify(pins));
        } catch (e) {
            console.error('Failed to save user pins:', e);
        }
    }

    function addPin(pinData) {
        const pins = loadAllPins();
        const newPin = {
            id: generateId(),
            ...pinData,
            createdAt: new Date().toISOString(),
            createdBy: currentAdmin ? currentAdmin.username : 'anonymous'
        };
        pins.unshift(newPin);
        saveAllPins(pins);

        // Also save to user's pins
        if (currentAdmin) {
            const userPins = loadUserPins(currentAdmin.username);
            userPins.unshift(newPin);
            saveUserPins(currentAdmin.username, userPins);
        }

        return newPin;
    }

    function deletePin(pinId, requesterUsername) {
        const pins = loadAllPins();
        const pinIndex = pins.findIndex(p => p.id === pinId);

        if (pinIndex === -1) {
            return { success: false, error: 'Pin not found' };
        }

        const pin = pins[pinIndex];
        const isOwner = pin.createdBy === requesterUsername;
        const isAdminUser = isAdmin(requesterUsername);

        // Admin can delete any pin, users can only delete their own
        if (!isAdminUser && !isOwner) {
            return { success: false, error: 'You can only delete your own pins' };
        }

        pins.splice(pinIndex, 1);
        saveAllPins(pins);

        // Also remove from user's pins
        const ownerPins = loadUserPins(pin.createdBy);
        const ownerPinIndex = ownerPins.findIndex(p => p.id === pinId);
        if (ownerPinIndex !== -1) {
            ownerPins.splice(ownerPinIndex, 1);
            saveUserPins(pin.createdBy, ownerPins);
        }

        return { success: true };
    }

    function getPins(options = {}) {
        let pins = loadAllPins();

        // Filter by author if specified
        if (options.author) {
            pins = pins.filter(p => p.createdBy === options.author);
        }

        // Pagination
        if (options.limit) {
            const offset = options.offset || 0;
            pins = pins.slice(offset, offset + options.limit);
        }

        return pins;
    }

    // ========================================
    // UI UPDATES
    // ========================================
    function updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const createBtn = document.getElementById('createBtn');
        const userMenu = document.getElementById('userMenu');
        const userInitial = document.getElementById('userInitial');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        const adminLink = document.getElementById('adminLink');
        const logoutBtn = document.getElementById('logoutBtn');

        if (currentAdmin) {
            // Logged in state
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userInitial) userInitial.textContent = currentAdmin.username.charAt(0).toUpperCase();
            if (userName) userName.textContent = currentAdmin.username;
            if (userRole) {
                userRole.textContent = currentAdmin.isDefault ? 'Super Admin' : 'Admin';
                userRole.className = 'role-badge ' + (currentAdmin.isDefault ? 'admin' : 'admin');
            }
            if (adminLink) adminLink.style.display = 'flex';
            if (createBtn) createBtn.style.display = 'inline-flex';
        } else {
            // Logged out state
            if (loginBtn) loginBtn.style.display = 'inline-flex';
            if (userMenu) userMenu.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
            if (createBtn) createBtn.style.display = 'inline-flex'; // Allow creating without login
        }

        // Bind logout
        if (logoutBtn) {
            logoutBtn.onclick = handleLogout;
        }
    }

    function handleLogout() {
        logout();
        showToast('Logged out successfully', 'success');
        // Redirect to home if on admin page
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }

    // ========================================
    // EVENT BINDING
    // ========================================
    function bindEvents() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal);
        }

        // Login modal form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }

        // Close modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') ||
                e.target.classList.contains('modal-close') ||
                e.target.closest('.modal-close')) {
                closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ========================================
    // MODAL HANDLING
    // ========================================
    function showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            // Focus username input
            setTimeout(() => {
                const input = modal.querySelector('input[name="username"]');
                if (input) input.focus();
            }, 100);
        }
    }

    function closeModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            // Reset form
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    function handleLoginSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const username = form.username?.value?.trim();

        if (!username) {
            showToast('Please enter a username', 'error');
            return;
        }

        const result = login(username);
        if (result.success) {
            closeModal();
            showToast(`Welcome, ${username}!`, 'success');
            // Redirect to admin if coming from admin page or if admin
            if (window.location.pathname.includes('admin.html') || result.admin.isDefault) {
                // Stay on current page, just update UI
            }
        } else {
            showToast(result.error, 'error');
        }
    }

    // ========================================
    // UTILITIES
    // ========================================
    function generateId() {
        return 'pin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function showToast(message, type = 'info') {
        // Create toast container if not exists
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 4000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        init,
        login,
        logout,
        getCurrentAdmin,
        isLoggedIn,
        isCurrentAdminDefault,
        addAdmin,
        removeAdmin,
        getAdminUsers,
        addPin,
        deletePin,
        getPins,
        loadAllPins,
        loadUserPins,
        showToast
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Auth.init);
} else {
    Auth.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}