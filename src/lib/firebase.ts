// Firebase Client SDK Configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyDKhbClgfhsCotKKa3o6im2D6KISu777pg",
    authDomain: "craniora-57b49.firebaseapp.com",
    projectId: "craniora-57b49",
    storageBucket: "craniora-57b49.firebasestorage.app",
    messagingSenderId: "1078676914693",
    appId: "1:1078676914693:web:b244ad0a522684b16b526c",
    measurementId: "G-DQ8BH56Q12"
}

// Initialize Firebase (prevent multiple initializations)
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

// Only initialize on client side
if (typeof window !== 'undefined') {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig)
    } else {
        app = getApps()[0]
    }

    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
}

export { app, auth, db, storage }
