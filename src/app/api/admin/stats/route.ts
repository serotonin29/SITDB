import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { ApiResponse, DashboardStats } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats - Get dashboard statistics (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get counts
        const [
            totalReports,
            pendingReports,
            inProgressReports,
            resolvedReports,
            totalUsers,
            totalRelawan,
            recentReports,
        ] = await Promise.all([
            prisma.disasterReport.count(),
            prisma.disasterReport.count({ where: { status: 'PENDING' } }),
            prisma.disasterReport.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.disasterReport.count({ where: { status: 'RESOLVED' } }),
            prisma.user.count(),
            prisma.user.count({ where: { role: 'RELAWAN' } }),
            prisma.disasterReport.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ])

        // Get reports by type
        const reportsByTypeRaw = await prisma.disasterReport.groupBy({
            by: ['type'],
            _count: { type: true },
        })

        const reportsByType: Record<string, number> = {}
        reportsByTypeRaw.forEach((item) => {
            reportsByType[item.type] = item._count.type
        })

        // Get reports by severity
        const reportsBySeverityRaw = await prisma.disasterReport.groupBy({
            by: ['severity'],
            _count: { severity: true },
        })

        const reportsBySeverity: Record<string, number> = {}
        reportsBySeverityRaw.forEach((item) => {
            reportsBySeverity[item.severity] = item._count.severity
        })

        const stats: DashboardStats = {
            totalReports,
            pendingReports,
            inProgressReports,
            resolvedReports,
            totalUsers,
            totalRelawan,
            reportsByType,
            reportsBySeverity,
            recentReports: recentReports as unknown as DashboardStats['recentReports'],
        }

        return NextResponse.json<ApiResponse<DashboardStats>>({
            success: true,
            data: stats,
        })
    } catch (error) {
        logger.error('Error fetching dashboard stats', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
