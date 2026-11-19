# Admin Login Integration Guide

Add admin login to your **existing login page** without changing anything else.

## Quick Integration

### 1. Add the script to your login page
```html
<!-- In your login.html, before </body> -->
<script src="admin-login-module.js"></script>
<script>
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        AdminLogin.init();

        // Add "Admin Login" button to your existing login form
        AdminLogin.renderAdminButton('#your-login-form-container', {
            text: 'Admin Login',
            className: 'btn btn-secondary',  // Use your existing button class
            onSuccess: (admin) => {
                console.log('Admin logged in:', admin.username);
                // Redirect or update UI
                window.location.href = '/'; // or your admin page
            }
        });

        // Show logged-in admin badge (optional)
        if (AdminLogin.isLoggedIn()) {
            AdminLogin.renderUserBadge('#your-header-user-area');
        }
    });
</script>
```

### 2. Check delete permissions in your pin component
```javascript
// In your pin rendering code
function renderPin(pin) {
    const canDelete = AdminLogin.canDeletePin(pin);

    return `
        <div class="pin">
            <img src="${pin.imageUrl}" alt="${pin.title}">
            <h3>${pin.title}</h3>
            ${canDelete ? `
                <button class="delete-btn" onclick="deletePin('${pin.id}')">
                    Delete
                </button>
            ` : ''}
        </div>
    `;
}
```

### 3. Admin management page (optional)
Create a simple `admin.html`:
```html
<script src="admin-login-module.js"></script>
<script>
    AdminLogin.init();

    // Only super admin can access
    if (!AdminLogin.isSuperAdmin()) {
        window.location.href = '/';
    }

    // Add new admin
    function addNewAdmin(username) {
        if (AdminLogin.addAdmin(username)) {
            alert('Admin added!');
            renderAdminList();
        }
    }

    // Remove admin
    function removeAdmin(username) {
        if (AdminLogin.removeAdmin(username)) {
            alert('Admin removed!');
            renderAdminList();
        }
    }

    function renderAdminList() {
        const admins = AdminLogin.getAdminUsers();
        document.getElementById('admin-list').innerHTML = admins.map(a => `
            <li>${a} ${a !== 'Paru@1523' ? `<button onclick="removeAdmin('${a}')">Remove</button>` : '(protected)'}</li>
        `).join('');
    }
</script>
```

## What This Gives You

| Feature | How it Works |
|---------|--------------|
| **Admin Login** | Username only: `Paru@1523` (default) |
| **Add Admins** | Super admin can add via `AdminLogin.addAdmin('newuser')` |
| **Delete Permissions** | `AdminLogin.canDeletePin(pin)` returns true if: super admin OR pin owner |
| **Session Persists** | Survives page refresh via localStorage |
| **Zero Dependencies** | Vanilla JS, ~3KB gzipped |

## Files in This Package

```
your-project/
├── admin-login-module.js      # Drop this in
├── INTEGRATION_GUIDE.md       # This file
└── (your existing files unchanged)
```

## No Changes To Your Existing Code

- ✅ Google login unchanged
- ✅ Your existing auth system unchanged
- ✅ Your pin components unchanged (just add `canDeletePin()` check)
- ✅ Your database/API unchanged
- ✅ Your deployment unchanged

Just include the script and call the two functions where needed!