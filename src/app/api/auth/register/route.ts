import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation'
import { logger, auditLog } from '@/lib/logger'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const { email, password, name, phone, role } = parsed.data

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Email sudah terdaftar' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: role === 'RELAWAN' ? 'RELAWAN' : 'MASYARAKAT',
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        })

        // Audit log
        await auditLog('USER_REGISTERED', 'User', user.id, user.id, { email, name, role }, request)

        logger.info('New user registered', { userId: user.id, email })

        return NextResponse.json<ApiResponse>(
            { success: true, data: user, message: 'Registrasi berhasil' },
            { status: 201 }
        )
    } catch (error) {
        logger.error('Registration error', { error })
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Terjadi kesalahan server' },
            { status: 500 }
        )
    }
}
