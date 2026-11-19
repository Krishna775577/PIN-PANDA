# 🚀 GitHub Deployment Guide — Pinterest Clone + ImageKit

---

## 📋 **One-Time Setup (5 min)**

### **1. GitHub Repository Secrets**
**Go to:** `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

**Add these Repository Secrets:**

| Secret Name | Value | Required |
|-------------|-------|----------|
| `IMAGEKIT_PUBLIC_KEY` | `public_weXalzztVXQLMVaLVQF0mRgITzg=` | ✅ Yes |
| `IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/i4eddmuuk` | ✅ Yes |
| `IMAGEKIT_AUTH_ENDPOINT` | `https://YOUR-BACKEND.vercel.app/api/imagekit-auth` | ✅ Yes |

**Choose ONE backend platform:**

#### **Option A: Vercel (Recommended)**
| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | From Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | `vercel inspect` output |
| `VERCEL_PROJECT_ID` | `vercel inspect` output |

#### **Option B: Netlify**
| Secret | Value |
|--------|-------|
| `NETLIFY_AUTH_TOKEN` | Netlify → User Settings → Applications |
| `NETLIFY_SITE_ID` | Netlify → Site Settings → General |

---

### **2. Backend Deploy (ImageKit Auth API)**

**Deploy `server/` folder as separate service:**

#### **Vercel (Easiest):**
```bash
cd server
vercel --prod
# Set env vars in Vercel dashboard:
# IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
```

#### **Netlify Functions:**
```bash
# Create netlify/functions/imagekit-auth.js from server/imagekit-auth.js
# Deploy: netlify deploy --prod
```

#### **Railway/Render/Fly.io:**
- Connect GitHub repo
- Set root directory to `server/`
- Add env vars

---

### **3. ImageKit Dashboard CORS**
**Settings → Security → CORS → Add:**
```
https://YOUR-FRONTEND.vercel.app
https://YOUR-FRONTEND.netlify.app
# Add your custom domain too
```

---

## 🔄 **Deploy Flow**

```bash
# 1. Make changes locally
git add .
git commit -m "feat: your changes"
git push origin main

# 2. GitHub Actions runs automatically:
#    ✅ Builds frontend
#    ✅ Injects ImageKit config
#    ✅ Deploys to Vercel/Netlify
#    ✅ Live in ~2 minutes
```

---

## 📁 **Project Structure for Deploy**

```
pinterest-clone/
├── .github/workflows/deploy.yml   ← Auto-deploy on push
├── .gitignore                     ← Secrets protected
├── assets/js/imagekit-config.js   ← Runtime config (no secrets)
├── server/                        ← Backend (deploy separately)
│   ├── imagekit-auth.js
│   ├── package.json
│   └── .env.example
├── index.html                     ← Entry point
├── create.html                    ← ImageKit upload
└── ...other HTML files
```

---

## 🔧 **Runtime Config Injection**

**The workflow injects this into your HTML at build time:**

```html
<!-- Injected before </head> -->
<script>
window.IMAGEKIT_CONFIG = {
  publicKey: "public_xxx",
  urlEndpoint: "https://ik.imagekit.io/xxx",
  authEndpoint: "https://your-backend.vercel.app/api/imagekit-auth"
};
</script>
```

**`assets/js/imagekit-config.js` reads `window.IMAGEKIT_CONFIG` automatically.**

---

## ✅ **Verification Checklist**

| Step | Verify |
|------|--------|
| Push to main | GitHub Actions runs (green check) |
| Frontend loads | No console errors for ImageKit |
| Create pin | Upload works → ImageKit Media Library |
| Transformations | `?tr=w-400,h-600` URLs work |
| Backend auth | `/api/imagekit-auth` returns `{signature, expire, token}` |
| CORS | No CORS errors in console |

---

## 🛠 **Troubleshooting**

### **"Auth endpoint failed"**
- Check `IMAGEKIT_AUTH_ENDPOINT` secret matches deployed backend URL
- Verify backend deployed and responding

### **"CORS error"**
- Add frontend domain to ImageKit Dashboard → CORS
- Check backend CORS allows your frontend domain

### **"Invalid signature"**
- Verify `IMAGEKIT_PRIVATE_KEY` in backend env vars
- Check backend time is synced (NTP)

### **Build fails**
- Check GitHub Actions logs
- Ensure all secrets are set correctly

---

## 🔐 **Security Notes**

| File | Committed? | Contains Secrets? |
|------|------------|-------------------|
| `assets/js/imagekit-config.js` | ✅ Yes | ❌ No (reads runtime config) |
| `.github/workflows/deploy.yml` | ✅ Yes | ❌ No (uses `${{ secrets }}`) |
| `server/.env.example` | ✅ Yes | ❌ No (template only) |
| `server/.env` | ❌ No (.gitignore) | ✅ Yes |
| `.env` | ❌ No (.gitignore) | ✅ Yes |

---

## 📞 **Need Help?**

- GitHub Actions logs: `Actions` tab in repo
- Vercel logs: Vercel dashboard → Project → Deployments
- Netlify logs: Netlify dashboard → Site → Deploys
- ImageKit logs: Dashboard → Logs

---

**Ready? Push to main and watch it deploy! 🎯**