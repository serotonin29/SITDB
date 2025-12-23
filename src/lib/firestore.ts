// Firestore utilities for realtime data sync
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore'
import { db } from './firebase'

// Collection names
export const COLLECTIONS = {
    REPORTS: 'reports',
    REPORT_STATUS: 'report_status',
    NOTIFICATIONS: 'notifications',
}

// Types
export interface FirestoreReport {
    id: string
    userId: string
    type: string
    title: string
    description: string
    latitude: number
    longitude: number
    address: string | null
    severity: string
    status: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

// Sync report to Firestore
export async function syncReportToFirestore(report: {
    id: string
    userId: string
    type: string
    title: string
    description: string
    latitude: number
    longitude: number
    address?: string | null
    severity: string
    status: string
}) {
    if (!db) return

    const reportRef = doc(db, COLLECTIONS.REPORTS, report.id)
    await setDoc(reportRef, {
        ...report,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    })
}

// Update report status in Firestore
export async function updateReportStatusInFirestore(
    reportId: string,
    status: string,
    updatedBy: string
) {
    if (!db) return

    const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)
    await updateDoc(reportRef, {
        status,
        updatedAt: Timestamp.now(),
    })

    // Also create a status entry
    const statusRef = doc(collection(db, COLLECTIONS.REPORT_STATUS))
    await setDoc(statusRef, {
        reportId,
        status,
        updatedBy,
        createdAt: Timestamp.now(),
    })
}

// Delete report from Firestore
export async function deleteReportFromFirestore(reportId: string) {
    if (!db) return

    const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)
    await deleteDoc(reportRef)
}

// Subscribe to reports (realtime)
export function subscribeToReports(
    callback: (reports: FirestoreReport[]) => void,
    filters?: { status?: string; type?: string }
) {
    if (!db) return () => { }

    const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc'),
        limit(100)
    ]

    if (filters?.status) {
        constraints.unshift(where('status', '==', filters.status))
    }
    if (filters?.type) {
        constraints.unshift(where('type', '==', filters.type))
    }

    const q = query(collection(db, COLLECTIONS.REPORTS), ...constraints)

    return onSnapshot(q, (snapshot) => {
        const reports: FirestoreReport[] = []
        snapshot.forEach((doc) => {
            reports.push({ id: doc.id, ...doc.data() } as FirestoreReport)
        })
        callback(reports)
    })
}

// Subscribe to single report
export function subscribeToReport(
    reportId: string,
    callback: (report: FirestoreReport | null) => void
) {
    if (!db) return () => { }

    const reportRef = doc(db, COLLECTIONS.REPORTS, reportId)

    return onSnapshot(reportRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() } as FirestoreReport)
        } else {
            callback(null)
        }
    })
}

// Create notification
export async function createNotification(notification: {
    userId: string
    title: string
    body: string
    reportId?: string
    type: 'NEW_REPORT' | 'STATUS_UPDATE' | 'SYSTEM'
}) {
    if (!db) return

    const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS))
    await setDoc(notifRef, {
        ...notification,
        read: false,
        createdAt: Timestamp.now(),
    })
}
