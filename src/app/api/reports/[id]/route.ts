import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateReportSchema } from '@/lib/validation'
import { logger, auditLog } from '@/lib/logger'
import type { ApiResponse, ReportDetail } from '@/types'

interface RouteParams {
    params: { id: string }
}

// GET /api/reports/[id] - Get single report with details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const report = await prisma.disasterReport.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                statusHistory: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                media: true,
            },
        })

        if (!report) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Laporan tidak ditemukan' },
                { status: 404 }
            )
        }

        return NextResponse.json<ApiResponse<ReportDetail>>({
            success: true,
            data: report as unknown as ReportDetail,
        })
    } catch (error) {
        logger.error('Error fetching report', { error, id: params.id })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// PUT /api/reports/[id] - Update report (owner or admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
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

        // Check permissions: only owner or admin can update
        if (existingReport.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Tidak memiliki izin' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const parsed = updateReportSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const updatedReport = await prisma.disasterReport.update({
            where: { id: params.id },
            data: parsed.data,
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

        // Audit log
        await auditLog('REPORT_UPDATED', 'DisasterReport', params.id, session.user.id, parsed.data, request)

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedReport,
            message: 'Laporan berhasil diperbarui',
        })
    } catch (error) {
        logger.error('Error updating report', { error, id: params.id })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// DELETE /api/reports/[id] - Delete report (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Only admin can delete
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Hanya admin yang dapat menghapus laporan' },
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

        await prisma.disasterReport.delete({
            where: { id: params.id },
        })

        // Audit log
        await auditLog('REPORT_DELETED', 'DisasterReport', params.id, session.user.id, { deletedReport: existingReport }, request)

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Laporan berhasil dihapus',
        })
    } catch (error) {
        logger.error('Error deleting report', { error, id: params.id })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
