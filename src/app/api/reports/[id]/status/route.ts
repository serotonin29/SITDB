import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateStatusSchema } from '@/lib/validation'
import { logger, auditLog } from '@/lib/logger'
import { updateReportStatusInFirestore } from '@/lib/firestore'
import type { ApiResponse } from '@/types'

interface RouteParams {
    params: { id: string }
}

// POST /api/reports/[id]/status - Update report status (relawan/admin only)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Only relawan or admin can update status
        if (session.user.role === 'MASYARAKAT') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Hanya relawan atau admin yang dapat memperbarui status' },
                { status: 403 }
            )
        }

        const existingReport = await prisma.disasterReport.findUnique({
            where: { id: params.id },
        })

        if (!existingReport) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Laporan tidak ditemukan' },
                { status: 404 }
            )
        }

        const body = await request.json()
        const parsed = updateStatusSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const { status, notes } = parsed.data

        // Update report status
        const updatedReport = await prisma.disasterReport.update({
            where: { id: params.id },
            data: { status },
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

        // Create status history entry
        const statusEntry = await prisma.reportStatus.create({
            data: {
                reportId: params.id,
                userId: session.user.id,
                status,
                notes,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        })

        // Audit log
        await auditLog(
            'REPORT_STATUS_UPDATED',
            'DisasterReport',
            params.id,
            session.user.id,
            { previousStatus: existingReport.status, newStatus: status, notes },
            request
        )

        // Sync to Firestore for realtime updates
        try {
            await updateReportStatusInFirestore(params.id, status, session.user.name || session.user.id)
        } catch (firestoreError) {
            logger.warn('Failed to sync status to Firestore', { error: firestoreError })
        }

        logger.info('Report status updated', {
            reportId: params.id,
            userId: session.user.id,
            previousStatus: existingReport.status,
            newStatus: status,
        })

        return NextResponse.json<ApiResponse>({
            success: true,
            data: { report: updatedReport, statusEntry },
            message: `Status berhasil diperbarui ke ${status}`,
        })
    } catch (error) {
        logger.error('Error updating report status', { error, id: params.id })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
