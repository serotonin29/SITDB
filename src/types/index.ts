import { UserRole } from '@prisma/client'

// ============================================
// USER TYPES
// ============================================

export interface SessionUser {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

// ============================================
// DISASTER REPORT TYPES
// ============================================

export interface ReportWithUser {
    id: string
    type: string
    title: string
    description: string
    latitude: number
    longitude: number
    address: string | null
    severity: string
    status: string
    createdAt: Date
    updatedAt: Date
    user: {
        id: string
        name: string
        email: string
    }
}

export interface ReportDetail extends ReportWithUser {
    statusHistory: {
        id: string
        status: string
        notes: string | null
        createdAt: Date
        user: {
            id: string
            name: string
            role: string
        }
    }[]
    media: {
        id: string
        url: string
        type: string
        filename: string | null
    }[]
}

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface DashboardStats {
    totalReports: number
    pendingReports: number
    inProgressReports: number
    resolvedReports: number
    totalUsers: number
    totalRelawan: number
    reportsByType: Record<string, number>
    reportsBySeverity: Record<string, number>
    recentReports: ReportWithUser[]
}

// ============================================
// MAP TYPES
// ============================================

export interface MapMarker {
    id: string
    latitude: number
    longitude: number
    type: string
    severity: string
    status: string
    title: string
}

// ============================================
// REALTIME EVENT TYPES
// ============================================

export interface RealtimeEvent {
    type: 'NEW_REPORT' | 'STATUS_UPDATE' | 'REPORT_DELETED'
    data: {
        reportId: string
        report?: ReportWithUser
        status?: string
        updatedBy?: string
    }
    timestamp: Date
}
