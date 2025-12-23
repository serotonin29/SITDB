import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReportSchema, reportQuerySchema } from '@/lib/validation'
import { logger, auditLog } from '@/lib/logger'
import { syncReportToFirestore } from '@/lib/firestore'
import type { ApiResponse, PaginatedResponse, ReportWithUser } from '@/types'

// GET /api/reports - List all reports with filters
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const queryParams = Object.fromEntries(searchParams.entries())

        const parsed = reportQuerySchema.safeParse(queryParams)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const { page, limit, status, type, severity, search, sortBy, sortOrder } = parsed.data

        // Build where clause
        const where: Record<string, unknown> = {}

        if (status) where.status = status
        if (type) where.type = type
        if (severity) where.severity = severity
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Get total count
        const total = await prisma.disasterReport.count({ where })

        // Get paginated results
        const reports = await prisma.disasterReport.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json<PaginatedResponse<ReportWithUser>>({
            success: true,
            data: reports as ReportWithUser[],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        logger.error('Error fetching reports', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// POST /api/reports - Create new report
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const parsed = createReportSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const report = await prisma.disasterReport.create({
            data: {
                ...parsed.data,
                userId: session.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        })

        // Create initial status history
        await prisma.reportStatus.create({
            data: {
                reportId: report.id,
                userId: session.user.id,
                status: 'PENDING',
                notes: 'Laporan baru dibuat',
            },
        })

        // Audit log
        await auditLog('REPORT_CREATED', 'DisasterReport', report.id, session.user.id, parsed.data, request)

        // Sync to Firestore for realtime updates
        try {
            await syncReportToFirestore({
                id: report.id,
                userId: report.userId,
                type: report.type,
                title: report.title,
                description: report.description,
                latitude: report.latitude,
                longitude: report.longitude,
                address: report.address,
                severity: report.severity,
                status: report.status,
            })
        } catch (firestoreError) {
            logger.warn('Failed to sync to Firestore', { error: firestoreError })
        }

        logger.info('New disaster report created', {
            reportId: report.id,
            userId: session.user.id,
            type: report.type,
        })

        return NextResponse.json<ApiResponse>(
            { success: true, data: report, message: 'Laporan berhasil dibuat' },
            { status: 201 }
        )
    } catch (error) {
        logger.error('Error creating report', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
