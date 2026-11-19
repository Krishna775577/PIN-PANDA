/**
 * Admin Login Module - Drop into your existing project
 * Adds admin login (username: Paru@1523) with pin management permissions
 *
 * USAGE:
 * 1. Include this script in your login page
 * 2. Call AdminLogin.init() on page load
 * 3. Add "Admin Login" button to your existing login UI
 * 4. Use AdminLogin.canDeletePin(pin) to check delete permissions
 */

const AdminLogin = (function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================
    const CONFIG = {
        storageKey: 'pinterest_admin_session',
        adminListKey: 'pinterest_admin_users',
        defaultAdmin: 'Paru@1523',
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
        restoreSession();
        return this;
    }

    // ========================================
    // ADMIN USER MANAGEMENT
    // ========================================
    function loadAdminUsers() {
        try {
            const stored = localStorage.getItem(CONFIG.adminListKey);
            adminUsers = stored ? JSON.parse(stored) : [];

            // Ensure default admin exists
            if (!adminUsers.includes(CONFIG.defaultAdmin)) {
                adminUsers.unshift(CONFIG.defaultAdmin);
                saveAdminUsers();
            }
        } catch (e) {
            adminUsers = [CONFIG.defaultAdmin];
        }
    }

    function saveAdminUsers() {
        localStorage.setItem(CONFIG.adminListKey, JSON.stringify(adminUsers));
    }

    function isAdmin(username) {
        return adminUsers.includes(username);
    }

    function addAdmin(username) {
        if (!username || isAdmin(username)) return false;
        adminUsers.push(username);
        saveAdminUsers();
        return true;
    }

    function removeAdmin(username) {
        if (username === CONFIG.defaultAdmin) return false; // Protect default
        const idx = adminUsers.indexOf(username);
        if (idx === -1) return false;
        adminUsers.splice(idx, 1);
        saveAdminUsers();
        return true;
    }

    function getAdminUsers() {
        return [...adminUsers];
    }

    // ========================================
    // SESSION MANAGEMENT
    // ========================================
    function restoreSession() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                currentAdmin = JSON.parse(stored);
            }
        } catch (e) {
            currentAdmin = null;
        }
    }

    function saveSession(username) {
        currentAdmin = {
            username,
            isDefault: username === CONFIG.defaultAdmin,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(currentAdmin));
    }

    function clearSession() {
        currentAdmin = null;
        localStorage.removeItem(CONFIG.storageKey);
    }

    // ========================================
    // LOGIN / LOGOUT
    // ========================================
    function login(username) {
        if (!isAdmin(username)) {
            return { success: false, error: 'Not authorized as admin' };
        }
        saveSession(username);
        return { success: true, admin: getCurrentAdmin() };
    }

    function logout() {
        clearSession();
        return { success: true };
    }

    function getCurrentAdmin() {
        return currentAdmin ? { ...currentAdmin } : null;
    }

    function isLoggedIn() {
        return currentAdmin !== null;
    }

    function isSuperAdmin() {
        return currentAdmin?.isDefault === true;
    }

    // ========================================
    // PERMISSION HELPERS (use in your pin components)
    // ========================================
    /**
     * Check if current user can delete a pin
     * @param {Object} pin - Pin object with createdBy property
     * @returns {boolean}
     */
    function canDeletePin(pin) {
        if (!currentAdmin) return false;
        if (isSuperAdmin()) return true; // Super admin can delete any
        return pin.createdBy === currentAdmin.username; // Regular admin: own pins only
    }

    /**
     * Check if current user can manage admins
     * @returns {boolean}
     */
    function canManageAdmins() {
        return isSuperAdmin();
    }

    /**
     * Get all pins current user can delete
     * @param {Array} allPins - All pins array
     * @returns {Array} - Filtered pins
     */
    function getDeletablePins(allPins) {
        if (!currentAdmin) return [];
        if (isSuperAdmin()) return allPins;
        return allPins.filter(p => p.createdBy === currentAdmin.username);
    }

    // ========================================
    // UI HELPERS
    // ========================================
    function renderAdminButton(containerSelector, options = {}) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = options.className || 'btn btn-admin-login';
        btn.innerHTML = options.icon
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg> ${options.text || 'Admin Login'}`
            : options.text || 'Admin Login';

        btn.style.cssText = options.style || '';
        btn.addEventListener('click', () => showLoginModal(options.onSuccess));
        container.appendChild(btn);

        return btn;
    }

    function showLoginModal(onSuccess) {
        // Remove existing modal
        const existing = document.getElementById('admin-login-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'admin-login-modal';
        modal.innerHTML = `
            <div class="admin-modal-overlay" style="
                position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                display: flex; align-items: center; justify-content: center;
                z-index: 10000; padding: 20px;">
                <div class="admin-modal" style="
                    background: white; border-radius: 12px; padding: 24px;
                    width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 20px; font-weight: 600;">Admin Login</h2>
                        <button id="admin-modal-close" style="
                            background: none; border: none; cursor: pointer;
                            padding: 8px; border-radius: 8px; color: #666;"
                            aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form id="admin-login-form">
                        <div style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px;">Username</label>
                            <input type="text" id="admin-username" name="username" required autocomplete="username"
                                style="width: 100%; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;"
                                placeholder="Enter admin username">
                        </div>
                        <p style="font-size: 13px; color: #888; margin-bottom: 20px;">
                            Default admin: <strong>${CONFIG.defaultAdmin}</strong>
                        </p>
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" id="admin-modal-cancel" style="
                                padding: 12px 24px; border: 1px solid #ddd; background: white;
                                border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
                            <button type="submit" style="
                                padding: 12px 24px; background: #FF6B00; color: white;
                                border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Login</button>
                        </div>
                    </form>
                    <p id="admin-login-error" style="color: #E60023; font-size: 13px; margin-top: 12px; display: none;"></p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        const closeModal = () => modal.remove();
        modal.querySelector('#admin-modal-close').onclick = closeModal;
        modal.querySelector('#admin-modal-cancel').onclick = closeModal;
        modal.querySelector('.admin-modal-overlay').onclick = (e) => {
            if (e.target === modal.querySelector('.admin-modal-overlay')) closeModal();
        };

        modal.querySelector('#admin-login-form').onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value.trim();
            const errorEl = document.getElementById('admin-login-error');

            if (!username) {
                errorEl.textContent = 'Please enter a username';
                errorEl.style.display = 'block';
                return;
            }

            const result = login(username);
            if (result.success) {
                closeModal();
                if (onSuccess) onSuccess(result.admin);
                // Dispatch custom event for other parts of app
                window.dispatchEvent(new CustomEvent('admin:login', { detail: result.admin }));
            } else {
                errorEl.textContent = result.error;
                errorEl.style.display = 'block';
            }
        };

        // Focus input
        setTimeout(() => document.getElementById('admin-username')?.focus(), 100);
    }

    function renderUserBadge(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container || !currentAdmin) return;

        const badge = document.createElement('div');
        badge.className = 'admin-user-badge';
        badge.innerHTML = `
            <span style="
                display: inline-flex; align-items: center; gap: 8px;
                padding: 6px 12px; background: #FFF4ED; color: #FF6B00;
                border-radius: 20px; font-size: 13px; font-weight: 600;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                    <path d="M8 21h8"></path>
                    <path d="M12 17v4"></path>
                </svg>
                ${currentAdmin.username} ${currentAdmin.isDefault ? '(Super Admin)' : '(Admin)'}
                <button id="admin-logout-btn" style="
                    background: none; border: none; color: #FF6B00; cursor: pointer;
                    font-size: 12px; font-weight: 500; padding: 0 0 0 8px;">Logout</button>
            </span>
        `;
        container.appendChild(badge);
        badge.querySelector('#admin-logout-btn').onclick = () => {
            logout();
            badge.remove();
            window.dispatchEvent(new CustomEvent('admin:logout'));
        };
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
        isSuperAdmin,
        canDeletePin,
        canManageAdmins,
        getDeletablePins,
        addAdmin,
        removeAdmin,
        getAdminUsers,
        renderAdminButton,
        renderUserBadge,
        showLoginModal,
        CONFIG
    };
})();

// Auto-init if not using modules
if (typeof window !== 'undefined') {
    window.AdminLogin = AdminLogin;
    // Don't auto-init - let user call AdminLogin.init() when ready
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminLogin;
}