# Pinterest Clone with Admin System & ImageKit

A full-featured Pinterest clone with image uploads via ImageKit, admin authentication, and complete pin management.

## Features

### 🎨 Frontend
- **Masonry-style pin grid** - Responsive, infinite scroll
- **Create pins** - Drag & drop image upload with ImageKit
- **Image transformations** - Automatic thumbnails, responsive images
- **Search & filter** - Real-time pin search

### 🔐 Admin System
- **Username-only login** - Default admin: `Paru@1523`
- **Admin management** - Add/remove admin users from settings
- **Pin permissions**:
  - **Admins**: Can delete ANY pin, manage all users
  - **Normal users**: Can only delete their own pins
  - **Super Admin** (default): Cannot be removed, full access

### ☁️ ImageKit Integration
- Client-side upload with progress
- Automatic transformations (thumbnails, responsive sizes)
- Secure authentication via backend endpoint
- CORS configured for deployment

### 🚀 Deployment Ready
- **Vercel** (frontend + backend)
- **Netlify** (frontend + functions)
- **GitHub Actions** CI/CD
- Environment variable injection at build time

## Quick Start

### 1. Clone & Install
```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configure Environment
```bash
# Frontend
cp .env.example .env
# Edit .env with your ImageKit credentials

# Backend
cd server
cp .env.example .env
# Edit .env with ImageKit private key
```

### 3. Run Locally
```bash
# Terminal 1 - Backend (port 3001)
cd server && npm run dev

# Terminal 2 - Frontend (port 3000)
npm run dev
```

### 4. Deploy

#### Option A: Vercel (Recommended)
```bash
# Frontend
vercel --prod

# Backend (separate project)
cd server && vercel --prod
```

#### Option B: Netlify
```bash
# Frontend
netlify deploy --prod --dir=.

# Backend
netlify deploy --prod --dir=server
```

#### GitHub Actions (Auto-deploy on push)
1. Add secrets in GitHub: Settings → Secrets → Actions
2. Push to main branch
3. Automatic deployment!

## Project Structure

```
pinterest-clone/
├── index.html              # Main pin grid
├── create.html             # Create pin page
├── admin.html              # Admin panel
├── vercel.json             # Vercel config (frontend)
├── netlify.toml            # Netlify config (frontend)
├── package.json            # Frontend dependencies
├── .env.example            # Frontend env template
├── assets/
│   ├── css/
│   │   └── style.css       # All styles
│   └── js/
│       ├── imagekit-config.js  # ImageKit client config
│       ├── auth.js             # Admin auth & pin management
│       ├── pins.js             # Pin grid rendering
│       ├── app.js              # Create pin page logic
│       └── admin.js            # Admin panel logic
├── server/                        # Backend (deploy separately)
│   ├── imagekit-auth.js      # ImageKit auth endpoint
│   ├── package.json
│   ├── vercel.json           # Vercel config (backend)
│   ├── netlify.toml          # Netlify config (backend)
│   ├── netlify/
│   │   └── functions/
│   │       └── imagekit-auth.js  # Netlify function
│   └── .env.example
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD
└── GITHUB_DEPLOY_GUIDE.md    # Detailed deployment guide
```

## Admin Usage

### Login as Admin
1. Click **Login** in header
2. Enter username: `Paru@1523`
3. You'll see **Admin Panel** in user dropdown

### Admin Panel Features
- **Stats Dashboard**: Total pins, unique authors, admin count, your pins
- **Admin Users Management**: Add/remove admin users
- **All Pins Management**: View, search, filter, and delete ANY pin

### Adding New Admins
1. Go to Admin Panel
2. Click "Add Admin"
3. Enter new username
4. They can now login and manage pins

## ImageKit Setup

1. Create account at [imagekit.io](https://imagekit.io)
2. Get credentials from Dashboard → Developer Options
3. Add to environment variables:
   - `IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY` (backend only)
   - `IMAGEKIT_URL_ENDPOINT`
4. Configure CORS in ImageKit Dashboard:
   - Add your frontend domain(s)

## Environment Variables

### Frontend (.env)
```env
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
IMAGEKIT_AUTH_ENDPOINT=https://your-backend.vercel.app/api/imagekit-auth
```

### Backend (server/.env)
```env
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
FRONTEND_URL=https://your-frontend.vercel.app
```

## Tech Stack

- **Frontend**: Vanilla JS (ES6+), CSS Grid/Flexbox, CSS Variables
- **Backend**: Node.js, Express (Vercel/Netlify Functions)
- **Image CDN**: ImageKit.io
- **Deployment**: Vercel / Netlify / GitHub Pages
- **CI/CD**: GitHub Actions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use for your own projects!