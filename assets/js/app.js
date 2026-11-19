/**
 * Main App Module - Create pin page with ImageKit upload
 * Handles pin creation form and ImageKit integration
 */

const App = (function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    let selectedFile = null;
    let uploadInProgress = false;

    // ========================================
    // DOM ELEMENTS (Create Page)
    // ========================================
    let createForm, fileInput, fileUploadArea, filePreview, previewImage;
    let titleInput, descriptionInput, linkInput, submitBtn;

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        // Check if we're on create page
        createForm = document.getElementById('createForm');
        if (!createForm) return; // Not on create page

        cacheElements();
        bindEvents();
        checkAuth();
    }

    function cacheElements() {
        fileInput = document.getElementById('fileInput');
        fileUploadArea = document.getElementById('fileUploadArea');
        filePreview = document.getElementById('filePreview');
        previewImage = document.getElementById('previewImage');
        titleInput = document.getElementById('titleInput');
        descriptionInput = document.getElementById('descriptionInput');
        linkInput = document.getElementById('linkInput');
        submitBtn = document.getElementById('submitBtn');
    }

    function bindEvents() {
        // File upload area click
        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => fileInput?.click());
            fileUploadArea.addEventListener('dragover', handleDragOver);
            fileUploadArea.addEventListener('dragleave', handleDragLeave);
            fileUploadArea.addEventListener('drop', handleDrop);
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }

        // Form submit
        if (createForm) {
            createForm.addEventListener('submit', handleSubmit);
        }

        // Remove preview button
        const removePreview = document.getElementById('removePreview');
        if (removePreview) {
            removePreview.addEventListener('click', clearFile);
        }
    }

    function checkAuth() {
        const currentAdmin = Auth.getCurrentAdmin();
        const authNotice = document.getElementById('authNotice');
        if (authNotice && !currentAdmin) {
            authNotice.style.display = 'block';
        }
    }

    // ========================================
    // FILE HANDLING
    // ========================================
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        fileUploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    }

    function processFile(file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            Auth.showToast('Please select a valid image file (JPEG, PNG, WebP, GIF)', 'error');
            clearFile();
            return;
        }

        // Validate file size (20MB)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            Auth.showToast(`File too large. Maximum size is 20MB`, 'error');
            clearFile();
            return;
        }

        selectedFile = file;
        showPreview(file);
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImage) previewImage.src = e.target.result;
            if (fileUploadArea) fileUploadArea.style.display = 'none';
            if (filePreview) filePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    function clearFile() {
        selectedFile = null;
        if (fileInput) fileInput.value = '';
        if (fileUploadArea) fileUploadArea.style.display = 'block';
        if (filePreview) filePreview.classList.remove('active');
        if (previewImage) previewImage.src = '';
    }

    // ========================================
    // FORM SUBMISSION
    // ========================================
    async function handleSubmit(e) {
        e.preventDefault();

        if (uploadInProgress) return;

        const title = titleInput?.value?.trim();
        const description = descriptionInput?.value?.trim();
        const link = linkInput?.value?.trim();

        // Validation
        if (!selectedFile) {
            Auth.showToast('Please select an image', 'error');
            return;
        }

        if (!title) {
            Auth.showToast('Please enter a title', 'error');
            titleInput?.focus();
            return;
        }

        // Upload to ImageKit
        await uploadAndCreatePin({ title, description, link });
    }

    async function uploadAndCreatePin(pinData) {
        uploadInProgress = true;
        setSubmitState(true);

        try {
            // Check if ImageKit is configured
            if (!window.ImageKitUpload) {
                throw new Error('ImageKit not configured. Please check configuration.');
            }

            Auth.showToast('Uploading image...', 'info');

            // Upload to ImageKit
            const uploadResult = await window.ImageKitUpload.upload(selectedFile, {
                folder: 'pins',
                tags: ['pinterest-clone', 'user-upload'],
                customMetadata: {
                    title: pinData.title,
                    description: pinData.description,
                    link: pinData.link
                },
                onProgress: (progress) => {
                    if (submitBtn) {
                        submitBtn.textContent = `Uploading... ${progress}%`;
                    }
                }
            });

            Auth.showToast('Image uploaded! Creating pin...', 'success');

            // Create pin with ImageKit data
            const pin = {
                title: pinData.title,
                description: pinData.description,
                link: pinData.link,
                imageUrl: uploadResult.url,
                thumbnailUrl: uploadResult.thumbnailUrl,
                width: uploadResult.width,
                height: uploadResult.height,
                fileSize: uploadResult.size,
                fileType: uploadResult.fileType,
                fileId: uploadResult.fileId,
                tags: uploadResult.tags,
                transformations: uploadResult.transformations
            };

            // Save via Auth module
            const createdPin = Auth.addPin(pin);

            Auth.showToast('Pin created successfully!', 'success');

            // Reset form
            createForm.reset();
            clearFile();

            // Redirect to home after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Upload error:', error);
            Auth.showToast(error.message || 'Failed to upload. Please try again.', 'error');
        } finally {
            uploadInProgress = false;
            setSubmitState(false);
        }
    }

    function setSubmitState(loading) {
        if (submitBtn) {
            submitBtn.disabled = loading;
            if (loading) {
                submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Uploading...';
            } else {
                submitBtn.innerHTML = 'Create Pin';
            }
        }
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
    document.addEventListener('DOMContentLoaded', App.init);
} else {
    App.init();
}