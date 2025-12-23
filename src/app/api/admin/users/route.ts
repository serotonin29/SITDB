import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateUserSchema } from '@/lib/validation'
import { logger, auditLog } from '@/lib/logger'
import type { ApiResponse, PaginatedResponse } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const role = searchParams.get('role')
        const search = searchParams.get('search')
        const status = searchParams.get('status')

        const where: Record<string, unknown> = {}

        if (role && ['MASYARAKAT', 'RELAWAN', 'ADMIN'].includes(role)) {
            where.role = role
        }

        if (status && ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'].includes(status)) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        const total = await prisma.user.count({ where })

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                _count: {
                    select: {
                        reports: true,
                        statusUpdates: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json<PaginatedResponse<unknown>>({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        logger.error('Error fetching users', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/users - Update user role (admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { userId, ...updateData } = body as { userId: string;[key: string]: unknown }

        if (!userId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User ID diperlukan' },
                { status: 400 }
            )
        }

        const parsed = updateUserSchema.safeParse(updateData)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!existingUser) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'User tidak ditemukan' },
                { status: 404 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: parsed.data,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        })

        // Audit log
        await auditLog(
            'USER_UPDATED',
            'User',
            userId,
            session.user.id,
            { previousData: existingUser, newData: parsed.data },
            request
        )

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedUser,
            message: 'User berhasil diperbarui',
        })
    } catch (error) {
        logger.error('Error updating user', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
