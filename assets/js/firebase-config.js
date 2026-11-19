
// ========================================
// PIN PANDA - FIREBASE CONFIGURATION
// ========================================

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

// ========================================
// FIREBASE PROJECT CONFIG
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCO62IfBYLDG35Av2QxTYEpFBA0VvY0Szw",
  authDomain: "pin-panda.firebaseapp.com",
  projectId: "pin-panda",
  storageBucket: "pin-panda.firebasestorage.app",
  messagingSenderId: "1028681507881",
  appId: "1:1028681507881:web:9dd3bfb3063ca0623fe838",
  measurementId: "G-0VM39SRJKH"
};

// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ========================================
// FIREBASE AUTH SERVICE
// ========================================

const FirebaseAuth = {

  // GOOGLE SIGN IN
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await this.createUserProfile(user);

      const idToken = await user.getIdToken();

      return { user, idToken };

    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },

  // EMAIL SIGN UP
  async signUpWithEmail(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;

      if (displayName) {
        await updateProfile(user, {
          displayName: displayName
        });
      }

      await this.createUserProfile(user, {
        displayName: displayName
      });

      const idToken = await user.getIdToken();

      return { user, idToken };

    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  },

  // EMAIL LOGIN
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = result.user;
      const idToken = await user.getIdToken();

      return { user, idToken };

    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  },

  // LOGOUT
  async signOut() {
    try {
      await signOut(auth);
      return true;

    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // CREATE USER PROFILE IN FIRESTORE
  async createUserProfile(firebaseUser, extraData = {}) {

    const userRef = doc(db, 'users', firebaseUser.uid);

    const userSnap = await getDoc(userRef);

    const userData = {
      uid: firebaseUser.uid,

      email: firebaseUser.email,

      displayName:
        firebaseUser.displayName ||
        extraData.displayName ||
        firebaseUser.email.split('@')[0],

      photoURL:
        firebaseUser.photoURL ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,

      username: (
        firebaseUser.displayName ||
        firebaseUser.email.split('@')[0]
      ).toLowerCase().replace(/\s+/g, ''),

      bio: '',

      followers: 0,

      following: [],

      pins: 0,

      boards: 0,

      settings: {
        emailNotifications: true,
        pushNotifications: true,
        privateProfile: false
      },

      ...extraData,

      updatedAt: serverTimestamp()
    };

    if (!userSnap.exists()) {

      userData.createdAt = serverTimestamp();

      await setDoc(userRef, userData);

    } else {

      await setDoc(userRef, userData, {
        merge: true
      });

    }

    return userData;
  },

  // GET CURRENT USER
  getCurrentUser() {
    return auth.currentUser;
  },

  // AUTH STATE LISTENER
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // GET FIREBASE TOKEN
  async getIdToken() {
    const user = auth.currentUser;

    if (user) {
      return await user.getIdToken();
    }

    return null;
  }

};

// ========================================
// GLOBAL EXPORTS
// ========================================

window.FirebaseAuth = FirebaseAuth;
window.firebaseAuth = auth;
window.firebaseDb = db;
