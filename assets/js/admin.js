/**
 * Admin Module - Admin panel functionality
 * Handles admin user management, pin management, and stats
 */

const Admin = (function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    let pinsPage = 1;
    const PINS_PER_PAGE = 30;
    let pinsLoading = false;
    let currentDeleteAction = null;
    let allUsers = [];

    // ========================================
    // DOM ELEMENTS
    // ========================================
    let elements = {};

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        // Check if we're on admin page
        if (!document.getElementById('adminStats')) return;

        // Verify admin access
        const currentAdmin = Auth.getCurrentAdmin();
        if (!currentAdmin) {
            window.location.href = 'index.html';
            return;
        }

        cacheElements();
        bindEvents();
        loadAllData();
    }

    function cacheElements() {
        elements = {
            adminStats: document.getElementById('adminStats'),
            adminUsersBody: document.getElementById('adminUsersBody'),
            allPinsBody: document.getElementById('allPinsBody'),
            loadMorePinsBtn: document.getElementById('loadMorePinsBtn'),
            pinSearchInput: document.getElementById('pinSearchInput'),
            pinFilterUser: document.getElementById('pinFilterUser'),
            addAdminBtn: document.getElementById('addAdminBtn'),
            addAdminModal: document.getElementById('addAdminModal'),
            addAdminForm: document.getElementById('addAdminForm'),
            newAdminUsername: document.getElementById('newAdminUsername'),
            confirmModal: document.getElementById('confirmModal'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmAction: document.getElementById('confirmAction'),
            confirmCancel: document.getElementById('confirmCancel')
        };
    }

    function bindEvents() {
        // Add admin button
        if (elements.addAdminBtn) {
            elements.addAdminBtn.addEventListener('click', () => openModal(elements.addAdminModal));
        }

        // Add admin form
        if (elements.addAdminForm) {
            elements.addAdminForm.addEventListener('submit', handleAddAdmin);
        }

        // Search pins
        if (elements.pinSearchInput) {
            let searchTimeout;
            elements.pinSearchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    pinsPage = 1;
                    loadPins(true);
                }, 300);
            });
        }

        // Filter by user
        if (elements.pinFilterUser) {
            elements.pinFilterUser.addEventListener('change', () => {
                pinsPage = 1;
                loadPins(true);
            });
        }

        // Load more pins
        if (elements.loadMorePinsBtn) {
            elements.loadMorePinsBtn.addEventListener('click', () => loadPins(false));
        }

        // Modal close handlers
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => closeAllModals());
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeAllModals();
            });
        });

        // Confirm modal
        if (elements.confirmAction) {
            elements.confirmAction.addEventListener('click', executeConfirmAction);
        }

        if (elements.confirmCancel) {
            elements.confirmCancel.addEventListener('click', closeAllModals);
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAllModals();
        });
    }

    // ========================================
    // DATA LOADING
    // ========================================
    function loadAllData() {
        loadStats();
        loadAdminUsers();
        loadUsersForFilter();
        loadPins(true);
    }

    function loadStats() {
        const currentAdmin = Auth.getCurrentAdmin();
        const allPins = Auth.loadAllPins();
        const adminUsers = Auth.getAdminUsers();

        // Count pins by current admin
        const myPins = allPins.filter(p => p.createdBy === currentAdmin.username).length;

        const statsHtml = `
            <div class="admin-stat-card">
                <div class="admin-stat-icon pins">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                        <path d="M8 21h8"></path>
                        <path d="M12 17v4"></path>
                    </svg>
                </div>
                <div class="admin-stat-info">
                    <h3>Total Pins</h3>
                    <div class="stat-value">${allPins.length}</div>
                </div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon users">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div class="admin-stat-info">
                    <h3>Unique Authors</h3>
                    <div class="stat-value">${new Set(allPins.map(p => p.createdBy)).size}</div>
                </div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon admins">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                </div>
                <div class="admin-stat-info">
                    <h3>Admin Users</h3>
                    <div class="stat-value">${adminUsers.length}</div>
                </div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-icon pins" style="background: var(--color-primary-light); color: var(--color-primary);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                        <path d="M8 21h8"></path>
                        <path d="M12 17v4"></path>
                    </svg>
                </div>
                <div class="admin-stat-info">
                    <h3>Your Pins</h3>
                    <div class="stat-value">${myPins}</div>
                </div>
            </div>
        `;

        if (elements.adminStats) {
            elements.adminStats.innerHTML = statsHtml;
        }
    }

    function loadAdminUsers() {
        const adminUsers = Auth.getAdminUsers();
        const currentAdmin = Auth.getCurrentAdmin();

        if (!elements.adminUsersBody) return;

        elements.adminUsersBody.innerHTML = adminUsers.map(admin => {
            const isCurrent = admin.username === currentAdmin.username;
            const isDefault = admin.isDefault;
            const canRemove = !isDefault && !isCurrent;

            return `
                <tr>
                    <td>
                        <span class="admin-user-avatar">${escapeHtml(admin.username.charAt(0).toUpperCase())}</span>
                        <span class="admin-user-name">${escapeHtml(admin.username)}${isCurrent ? ' (You)' : ''}</span>
                    </td>
                    <td>
                        <span class="admin-badge ${isDefault ? 'admin' : 'admin'}">${isDefault ? 'Super Admin' : 'Admin'}</span>
                    </td>
                    <td>
                        <span style="color: var(--color-success);">Active</span>
                    </td>
                    <td style="color: var(--color-text-secondary); font-size: 13px;">
                        ${formatDate(admin.createdAt)}
                    </td>
                    <td>
                        ${canRemove ? `
                            <button class="btn btn-danger admin-action-btn" data-action="remove-admin" data-username="${escapeHtml(admin.username)}">
                                Remove
                            </button>
                        ` : `
                            <span style="color: var(--color-text-muted); font-size: 13px;">${isDefault ? 'Protected' : 'Current'}</span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');

        // Bind remove buttons
        elements.adminUsersBody.querySelectorAll('[data-action="remove-admin"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                confirmRemoveAdmin(username);
            });
        });
    }

    function loadUsersForFilter() {
        const allPins = Auth.loadAllPins();
        const users = [...new Set(allPins.map(p => p.createdBy))].sort();

        allUsers = users;

        if (elements.pinFilterUser) {
            const currentValue = elements.pinFilterUser.value;
            elements.pinFilterUser.innerHTML = '<option value="">All Users</option>' +
                users.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join('');
            elements.pinFilterUser.value = currentValue;
        }
    }

    function loadPins(reset = false) {
        if (pinsLoading) return;

        if (reset) {
            pinsPage = 1;
            if (elements.allPinsBody) elements.allPinsBody.innerHTML = '';
        }

        pinsLoading = true;
        if (elements.loadMorePinsBtn) {
            elements.loadMorePinsBtn.disabled = true;
            elements.loadMorePinsBtn.textContent = 'Loading...';
        }

        setTimeout(() => {
            const searchQuery = elements.pinSearchInput?.value?.toLowerCase().trim();
            const filterUser = elements.pinFilterUser?.value;

            let pins = Auth.loadAllPins();

            // Apply filters
            if (searchQuery) {
                pins = pins.filter(p =>
                    (p.title || '').toLowerCase().includes(searchQuery) ||
                    (p.description || '').toLowerCase().includes(searchQuery) ||
                    (p.createdBy || '').toLowerCase().includes(searchQuery)
                );
            }

            if (filterUser) {
                pins = pins.filter(p => p.createdBy === filterUser);
            }

            // Sort by newest first
            pins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Paginate
            const start = (pinsPage - 1) * PINS_PER_PAGE;
            const pagePins = pins.slice(start, start + PINS_PER_PAGE);

            if (pagePins.length === 0 && pinsPage === 1) {
                if (elements.allPinsBody) {
                    elements.allPinsBody.innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 48px; color: var(--color-text-secondary);">
                                No pins found
                            </td>
                        </tr>
                    `;
                }
            } else {
                pagePins.forEach(pin => appendPinRow(pin));
            }

            pinsPage++;
            pinsLoading = false;

            const hasMore = start + PINS_PER_PAGE < pins.length;
            if (elements.loadMorePinsBtn) {
                elements.loadMorePinsBtn.style.display = hasMore ? 'block' : 'none';
                elements.loadMorePinsBtn.disabled = false;
                elements.loadMorePinsBtn.textContent = 'Load More Pins';
            }
        }, 200);
    }

    function appendPinRow(pin) {
        if (!elements.allPinsBody) return;

        const currentAdmin = Auth.getCurrentAdmin();
        const isOwner = pin.createdBy === currentAdmin?.username;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${escapeHtml(getOptimizedImageUrl(pin.imageUrl, 'thumbnail-small'))}"
                     alt="${escapeHtml(pin.title || 'Pin')}"
                     class="admin-pin-thumb"
                     loading="lazy">
            </td>
            <td>
                <div style="font-weight: 500; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${escapeHtml(pin.title || 'Untitled')}
                </div>
                ${pin.description ? `<div style="font-size: 12px; color: var(--color-text-secondary); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(pin.description)}</div>` : ''}
            </td>
            <td>
                <span class="admin-user-avatar">${escapeHtml((pin.createdBy || 'U').charAt(0).toUpperCase())}</span>
                <span class="admin-user-name">${escapeHtml(pin.createdBy || 'Unknown')}</span>
            </td>
            <td style="color: var(--color-text-secondary); font-size: 13px;">
                ${formatDate(pin.createdAt)}
            </td>
            <td>
                <button class="btn btn-danger admin-action-btn" data-action="delete-pin" data-pin-id="${escapeHtml(pin.id)}">
                    Delete
                </button>
            </td>
        `;

        // Bind delete button
        const deleteBtn = row.querySelector('[data-action="delete-pin"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => confirmDeletePin(pin.id, pin.title));
        }

        elements.allPinsBody.appendChild(row);
    }

    // ========================================
    // ADMIN USER MANAGEMENT
    // ========================================
    function handleAddAdmin(e) {
        e.preventDefault();
        const username = elements.newAdminUsername?.value?.trim();

        if (!username) {
            Auth.showToast('Please enter a username', 'error');
            return;
        }

        const result = Auth.addAdmin(username);
        if (result) {
            Auth.showToast(`Admin "${username}" added successfully`, 'success');
            closeAllModals();
            elements.addAdminForm.reset();
            loadAdminUsers();
            loadStats();
        } else {
            Auth.showToast('Username already exists or is invalid', 'error');
        }
    }

    function confirmRemoveAdmin(username) {
        currentDeleteAction = {
            type: 'remove-admin',
            username
        };
        openConfirmModal(
            'Remove Admin',
            `Are you sure you want to remove admin access for <strong>${escapeHtml(username)}</strong>? They will no longer be able to manage pins or add other admins.`,
            'Remove Admin'
        );
    }

    // ========================================
    // PIN MANAGEMENT
    // ========================================
    function confirmDeletePin(pinId, title) {
        currentDeleteAction = {
            type: 'delete-pin',
            pinId,
            title
        };
        openConfirmModal(
            'Delete Pin',
            `Are you sure you want to delete <strong>"${escapeHtml(title || 'Untitled')}"</strong>? This action cannot be undone.`,
            'Delete Pin'
        );
    }

    function executeConfirmAction() {
        if (!currentDeleteAction) return;

        const { type, pinId, username, title } = currentDeleteAction;
        let result;

        if (type === 'remove-admin') {
            result = Auth.removeAdmin(username);
            if (result) {
                Auth.showToast(`Admin "${username}" removed`, 'success');
                loadAdminUsers();
                loadStats();
            } else {
                Auth.showToast('Cannot remove default admin', 'error');
            }
        } else if (type === 'delete-pin') {
            const currentAdmin = Auth.getCurrentAdmin();
            result = Auth.deletePin(pinId, currentAdmin.username);
            if (result.success) {
                Auth.showToast('Pin deleted successfully', 'success');
                loadPins(true);
                loadStats();
            } else {
                Auth.showToast(result.error, 'error');
            }
        }

        closeAllModals();
        currentDeleteAction = null;
    }

    // ========================================
    // MODAL HELPERS
    // ========================================
    function openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        currentDeleteAction = null;
    }

    function openConfirmModal(title, message, actionText) {
        if (elements.confirmTitle) elements.confirmTitle.textContent = title;
        if (elements.confirmMessage) elements.confirmMessage.innerHTML = message;
        if (elements.confirmAction) elements.confirmAction.textContent = actionText;
        openModal(elements.confirmModal);
    }

    // ========================================
    // UTILITIES
    // ========================================
    function getOptimizedImageUrl(url, transformation) {
        if (!url) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect fill="%23f0f0f0" width="200" height="300"/></svg>';
        if (window.ImageKitUtils && window.ImageKitUtils.isImageKitUrl(url)) {
            return window.ImageKitTransform.getNamedUrl(url, transformation);
        }
        return url;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        init
    };
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Admin.init);
} else {
    Admin.init();
}