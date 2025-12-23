// Firebase Admin SDK Configuration (Server-side only)
import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getStorage, Storage } from 'firebase-admin/storage'

let adminApp: App
let adminAuth: Auth
let adminDb: Firestore
let adminStorage: Storage

const initializeFirebaseAdmin = () => {
    if (getApps().length === 0) {
        const privateKey = process.env.SITDB_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

        adminApp = initializeApp({
            credential: cert({
                projectId: process.env.SITDB_ADMIN_PROJECT_ID,
                clientEmail: process.env.SITDB_ADMIN_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        })
    } else {
        adminApp = getApps()[0]
    }

    adminAuth = getAuth(adminApp)
    adminDb = getFirestore(adminApp)
    adminStorage = getStorage(adminApp)

    return { adminApp, adminAuth, adminDb, adminStorage }
}

// Lazy initialization
export const getFirebaseAdmin = () => {
    if (!adminApp) {
        initializeFirebaseAdmin()
    }
    return { adminApp, adminAuth, adminDb, adminStorage }
}

// Verify Firebase ID token
export async function verifyIdToken(idToken: string) {
    const { adminAuth } = getFirebaseAdmin()
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        return decodedToken
    } catch (error) {
        console.error('Error verifying Firebase token:', error)
        return null
    }
}

// Create custom token for user
export async function createCustomToken(uid: string, claims?: Record<string, unknown>) {
    const { adminAuth } = getFirebaseAdmin()
    return adminAuth.createCustomToken(uid, claims)
}

// Get user by email
export async function getUserByEmail(email: string) {
    const { adminAuth } = getFirebaseAdmin()
    try {
        return await adminAuth.getUserByEmail(email)
    } catch {
        return null
    }
}

// Set custom claims (role)
export async function setUserRole(uid: string, role: string) {
    const { adminAuth } = getFirebaseAdmin()
    await adminAuth.setCustomUserClaims(uid, { role })
}

export { adminApp, adminAuth, adminDb, adminStorage }
