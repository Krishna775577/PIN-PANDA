// ========================================
// IMAGEKIT CONFIGURATION
// ========================================
// Production-ready config:
// - Reads from window.IMAGEKIT_CONFIG (injected at build/deploy time)
// - Falls back to local defaults for development
// - NEVER hardcode secrets in this file

(function() {
  'use strict';

  // ========================================
  // RUNTIME CONFIG (injected at deploy time)
  // ========================================
  // In production, inject via:
  // - Vite/Parcel: import.meta.env
  // - Webpack: DefinePlugin
  // - Netlify/Vercel: Build env vars → HTML injection
  // - GitHub Pages: GitHub Actions → replace tokens
  const runtimeConfig = window.IMAGEKIT_CONFIG || {};

  // ========================================
  // DEFAULTS (Development only)
  // ========================================
  const defaults = {
    // Public key is safe to expose
    publicKey: runtimeConfig.publicKey || 'public_weXalzztVXQLMVaLVQF0mRgITzg=',
    urlEndpoint: runtimeConfig.urlEndpoint || 'https://ik.imagekit.io/i4eddmuuk',

    // Auth endpoint - MUST be set in production
    // Local: 'http://localhost:3001/api/imagekit-auth'
    // Production: '/api/imagekit-auth' (same-origin) or 'https://api.yourdomain.com/api/imagekit-auth'
    authEndpoint: runtimeConfig.authEndpoint || 'http://localhost:3001/api/imagekit-auth',

    upload: {
      defaultFolder: 'pins',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFileSize: 20 * 1024 * 1024,
      useUniqueFileName: true,
      defaultTags: ['pinterest-clone'],
    },

    transformations: {
      'pin-thumbnail': 'tr:w-400,h-600,fo-auto,q-80',
      'pin-full': 'tr:w-800,h-1200,fo-auto,q-85',
      'pin-medium': 'tr:w-600,h-900,fo-auto,q-80',
      'board-cover': 'tr:w-400,h-400,c-at_max,fo-auto,q-80',
      'avatar': 'tr:w-100,h-100,c-at_max,fo-auto,q-80',
      'avatar-large': 'tr:w-200,h-200,c-at_max,fo-auto,q-80',
      'thumbnail-small': 'tr:w-200,h-300,fo-auto,q-70',
    },

    fallbackToDataUrl: true,
  };

  // ========================================
  // VALIDATION
  // ========================================
  if (!defaults.publicKey || defaults.publicKey === 'YOUR_PUBLIC_KEY') {
    console.warn('[ImageKit] Public key not configured. Set window.IMAGEKIT_CONFIG.publicKey at runtime.');
  }
  if (!defaults.authEndpoint || defaults.authEndpoint.includes('localhost')) {
    console.warn('[ImageKit] Auth endpoint points to localhost. Set window.IMAGEKIT_CONFIG.authEndpoint for production.');
  }

  // ========================================
  // EXPORT
  // ========================================
  window.ImageKitConfig = defaults;

  // ========================================
  // IMAGEKIT AUTHENTICATION
  // ========================================
  const ImageKitAuth = {
    _cache: null,
    _cacheExpiry: 0,

    async getAuthParams() {
      const now = Date.now();

      if (this._cache && now < this._cacheExpiry - 60000) {
        return this._cache;
      }

      try {
        const response = await fetch(ImageKitConfig.authEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Auth endpoint returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.signature || !data.expire || !data.token) {
          throw new Error('Invalid auth response format');
        }

        this._cache = {
          signature: data.signature,
          expire: data.expire,
          token: data.token,
        };
        this._cacheExpiry = data.expire * 1000;

        return this._cache;
      } catch (error) {
        console.error('ImageKit auth failed:', error);
        throw new Error('Failed to get upload credentials. Check auth endpoint.');
      }
    },

    clearCache() {
      this._cache = null;
      this._cacheExpiry = 0;
    },
  };

  // ========================================
  // IMAGEKIT UPLOAD
  // ========================================
  const ImageKitUpload = {
    async upload(file, options = {}) {
      const validation = this.validateFile(file);
      if (!validation.valid) throw new Error(validation.error);

      const authParams = await ImageKitAuth.getAuthParams();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', options.fileName || file.name);
      formData.append('folder', options.folder || ImageKitConfig.upload.defaultFolder);
      formData.append('useUniqueFileName', options.useUniqueFileName !== false ? 'true' : 'false');
      formData.append('tags', JSON.stringify([
        ...ImageKitConfig.upload.defaultTags,
        ...(options.tags || [])
      ]));
      formData.append('signature', authParams.signature);
      formData.append('expire', authParams.expire);
      formData.append('token', authParams.token);
      formData.append('publicKey', ImageKitConfig.publicKey);

      if (options.customMetadata) {
        formData.append('customMetadata', JSON.stringify(options.customMetadata));
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && options.onProgress) {
            options.onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(this.formatUploadResponse(JSON.parse(xhr.responseText)));
            } catch {
              reject(new Error('Invalid response from ImageKit'));
            }
          } else {
            try {
              reject(new Error(JSON.parse(xhr.responseText).message || `Upload failed: ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
        xhr.send(formData);
        this._currentXhr = xhr;
      });
    },

    cancel() {
      if (this._currentXhr) {
        this._currentXhr.abort();
        this._currentXhr = null;
      }
    },

    validateFile(file) {
      if (!ImageKitConfig.upload.allowedTypes.includes(file.type)) {
        return { valid: false, error: `Unsupported file type: ${file.type}` };
      }
      if (file.size > ImageKitConfig.upload.maxFileSize) {
        const maxMB = ImageKitConfig.upload.maxFileSize / (1024 * 1024);
        return { valid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${maxMB}MB` };
      }
      return { valid: true };
    },

    formatUploadResponse(response) {
      return {
        fileId: response.fileId,
        name: response.name,
        url: response.url,
        thumbnailUrl: response.thumbnailUrl,
        width: response.width,
        height: response.height,
        size: response.size,
        fileType: response.fileType,
        filePath: response.filePath,
        tags: response.tags,
        customMetadata: response.customMetadata,
        uploadedAt: new Date().toISOString(),
        transformations: this.generateTransformationUrls(response.url),
      };
    },

    generateTransformationUrls(originalUrl) {
      const urls = {};
      for (const [name, transform] of Object.entries(ImageKitConfig.transformations)) {
        urls[name] = `${originalUrl}?${transform}`;
      }
      return urls;
    },

    async uploadMultiple(files, options = {}) {
      const results = [];
      for (const file of files) {
        results.push(await this.upload(file, {
          ...options,
          onProgress: options.onProgress ? (p) => options.onProgress(p, file.name) : undefined
        }));
      }
      return results;
    },
  };

  // ========================================
  // IMAGEKIT TRANSFORMATIONS
  // ========================================
  const ImageKitTransform = {
    buildUrl(originalUrl, transformation) {
      if (!originalUrl) return '';
      if (!transformation) return originalUrl;
      return `${originalUrl}?${transformation}`;
    },

    getNamedUrl(originalUrl, name) {
      return this.buildUrl(originalUrl, ImageKitConfig.transformations[name]);
    },

    getPinThumbnail(url) { return this.getNamedUrl(url, 'pin-thumbnail'); },
    getPinFull(url) { return this.getNamedUrl(url, 'pin-full'); },
    getBoardCover(url) { return this.getNamedUrl(url, 'board-cover'); },
    getAvatar(url, large = false) { return this.getNamedUrl(url, large ? 'avatar-large' : 'avatar'); },

    custom(url, opts) {
      const params = [];
      if (opts.width) params.push(`w-${opts.width}`);
      if (opts.height) params.push(`h-${opts.height}`);
      if (opts.crop) params.push(`c-${opts.crop}`);
      if (opts.quality) params.push(`q-${opts.quality}`);
      if (opts.format) params.push(`f-${opts.format}`);
      if (opts.focus) params.push(`fo-${opts.focus}`);
      return this.buildUrl(url, `tr:${params.join(',')}`);
    },

    srcset(url, widths = [400, 600, 800, 1200]) {
      return widths.map(w => `${this.custom(url, { width: w, focus: 'auto', quality: 80 })} ${w}w`).join(', ');
    },
  };

  // ========================================
  // IMAGEKIT UTILITIES
  // ========================================
  const ImageKitUtils = {
    isImageKitUrl(url) {
      return url && url.includes(ImageKitConfig.urlEndpoint);
    },

    extractFileId(url) {
      if (!this.isImageKitUrl(url)) return null;
      const match = url.match(/\/([a-zA-Z0-9_-]+)\.(jpg|jpeg|png|webp|gif)(\?|$)/);
      return match ? match[1] : null;
    },

    getOptimizedUrl(url, width, height) {
      return ImageKitTransform.custom(url, { width, height, focus: 'auto', quality: 80, format: 'auto' });
    },

    createBlurPlaceholder(url) {
      return ImageKitTransform.custom(url, { width: 20, height: 20, quality: 20, format: 'auto' });
    },
  };

  // ========================================
  // EXPORTS
  // ========================================
  window.ImageKitAuth = ImageKitAuth;
  window.ImageKitUpload = ImageKitUpload;
  window.ImageKitTransform = ImageKitTransform;
  window.ImageKitUtils = ImageKitUtils;

})();