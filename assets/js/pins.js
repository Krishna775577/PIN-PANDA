/**
 * Pins Module - Pin rendering, loading, and management
 * Works with Auth module for permissions
 */

const Pins = (function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    let currentPage = 1;
    const PINS_PER_PAGE = 20;
    let isLoading = false;
    let hasMore = true;
    let currentFilter = null;

    // ========================================
    // DOM ELEMENTS
    // ========================================
    let pinGrid, loadMoreBtn, emptyState;

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        pinGrid = document.getElementById('pinGrid');
        loadMoreBtn = document.getElementById('loadMoreBtn');
        emptyState = document.getElementById('emptyState');

        if (!pinGrid) return;

        bindEvents();
        loadPins(true); // Initial load
    }

    function bindEvents() {
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMore);
        }

        // Search form
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', handleSearch);
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    handleSearch(e);
                }, 300);
            });
        }
    }

    // ========================================
    // PIN LOADING
    // ========================================
    function loadPins(reset = false) {
        if (isLoading) return;

        if (reset) {
            currentPage = 1;
            hasMore = true;
            pinGrid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'none';
        }

        isLoading = true;
        showLoadingSkeletons();

        // Simulate async loading
        setTimeout(() => {
            const pins = Auth.getPins({
                author: currentFilter,
                limit: PINS_PER_PAGE,
                offset: (currentPage - 1) * PINS_PER_PAGE
            });

            hideLoadingSkeletons();

            if (pins.length === 0 && currentPage === 1) {
                showEmptyState();
            } else {
                hideEmptyState();
                pins.forEach(pin => appendPin(pin));
            }

            hasMore = pins.length === PINS_PER_PAGE;
            currentPage++;
            isLoading = false;

            updateLoadMoreButton();
        }, 300);
    }

    function loadMore() {
        if (!hasMore || isLoading) return;
        loadPins(false);
    }

    function handleSearch(e) {
        e.preventDefault();
        const query = document.getElementById('searchInput')?.value?.toLowerCase().trim();
        currentFilter = query || null;
        loadPins(true);
    }

    function updateLoadMoreButton() {
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMore ? 'block' : 'none';
            loadMoreBtn.textContent = hasMore ? 'Load More' : 'No more pins';
            loadMoreBtn.disabled = !hasMore;
        }
    }

    // ========================================
    // PIN RENDERING
    // ========================================
    function appendPin(pin) {
        const card = createPinCard(pin);
        pinGrid.appendChild(card);
    }

    function createPinCard(pin) {
        const card = document.createElement('article');
        card.className = 'pin-card';
        card.dataset.pinId = pin.id;

        const currentAdmin = Auth.getCurrentAdmin();
        const isOwner = pin.createdBy === currentAdmin?.username;
        const isAdminUser = Auth.isLoggedIn();
        const canDelete = isAdminUser && (isOwner || Auth.isCurrentAdminDefault() || isAdminUser);

        // Get optimized image URL
        const imageUrl = getOptimizedImageUrl(pin.imageUrl, 'pin-thumbnail');

        card.innerHTML = `
            <div class="pin-image-wrapper">
                <img class="pin-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(pin.title || 'Pin')}" loading="lazy">
                ${canDelete ? `
                    <div class="pin-actions">
                        <button class="pin-action-btn delete" data-action="delete" data-pin-id="${escapeHtml(pin.id)}" title="Delete pin">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="pin-info">
                <h3 class="pin-title">${escapeHtml(pin.title || 'Untitled')}</h3>
                <div class="pin-meta">
                    <div class="pin-author">
                        <span class="pin-author-avatar">${escapeHtml((pin.createdBy || 'U').charAt(0).toUpperCase())}</span>
                        <span>${escapeHtml(pin.createdBy || 'Unknown')}</span>
                    </div>
                    <span class="pin-date">${formatDate(pin.createdAt)}</span>
                    ${isAdminUser ? `<span class="pin-admin-badge">Admin</span>` : ''}
                </div>
            </div>
        `;

        // Bind delete button
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleDeletePin(pin.id);
            });
        }

        return card;
    }

    function handleDeletePin(pinId) {
        if (!confirm('Are you sure you want to delete this pin?')) return;

        const currentAdmin = Auth.getCurrentAdmin();
        if (!currentAdmin) {
            Auth.showToast('Please login to delete pins', 'error');
            return;
        }

        const result = Auth.deletePin(pinId, currentAdmin.username);
        if (result.success) {
            // Remove from DOM
            const card = document.querySelector(`[data-pin-id="${pinId}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 200);
            }
            Auth.showToast('Pin deleted successfully', 'success');
        } else {
            Auth.showToast(result.error, 'error');
        }
    }

    // ========================================
    // IMAGE HELPERS
    // ========================================
    function getOptimizedImageUrl(url, transformation) {
        if (!url) return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><rect fill="%23f0f0f0" width="400" height="600"/></svg>';

        // If it's an ImageKit URL, use transformation
        if (window.ImageKitUtils && window.ImageKitUtils.isImageKitUrl(url)) {
            return window.ImageKitTransform.getNamedUrl(url, transformation);
        }

        // If it's a data URL or external, return as-is
        return url;
    }

    // ========================================
    // LOADING STATES
    // ========================================
    function showLoadingSkeletons() {
        const skeletonCount = currentPage === 1 ? 6 : 3;
        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'pin-skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                </div>
            `;
            pinGrid.appendChild(skeleton);
        }
    }

    function hideLoadingSkeletons() {
        const skeletons = pinGrid.querySelectorAll('.pin-skeleton');
        skeletons.forEach(s => s.remove());
    }

    function showEmptyState() {
        if (emptyState) emptyState.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }

    function hideEmptyState() {
        if (emptyState) emptyState.style.display = 'none';
    }

    // ========================================
    // UTILITIES
    // ========================================
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        loadPins,
        loadMore,
        appendPin,
        createPinCard,
        getOptimizedImageUrl
    };
})();

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Pins.init);
} else {
    Pins.init();
}