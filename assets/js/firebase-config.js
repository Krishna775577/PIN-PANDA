// ========================================
// FIREBASE CONFIGURATION
// ========================================
// Replace these with your Firebase project config from:
// Firebase Console → Project Settings → General → Your apps → Web app (</>)

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ========================================
// FIREBASE AUTH SERVICE
// ========================================
const FirebaseAuth = {
  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create/update user profile in Firestore
      await this.createUserProfile(user);

      // Get ID token for backend API calls
      const idToken = await user.getIdToken();

      return { user, idToken };
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },

  // Sign up with email/password
  async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      await this.createUserProfile(user, { displayName });

      const idToken = await user.getIdToken();
      return { user, idToken };
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  },

  // Sign in with email/password
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      const idToken = await user.getIdToken();
      return { user, idToken };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Create/update user profile in Firestore
  async createUserProfile(firebaseUser, extraData = {}) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || extraData.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      username: (firebaseUser.displayName || firebaseUser.email.split('@')[0]).toLowerCase().replace(/\s+/g, ''),
      bio: '',
      followers: 0,
      following: [],
      pins: 0,
      boards: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        privateProfile: false
      },
      ...extraData
    };

    // Only set if not exists, or merge updates
    if (!userSnap.exists()) {
      await setDoc(userRef, userData);
    } else {
      await setDoc(userRef, {
        ...userData,
        createdAt: userSnap.data().createdAt,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return userData;
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen for auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Get ID token for API calls
  async getIdToken() {
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
    return null;
  }
};

// Export for use in other modules
window.FirebaseAuth = FirebaseAuth;
window.firebaseAuth = auth;
window.firebaseDb = db;