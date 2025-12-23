import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const parsed = loginSchema.safeParse(credentials)

                    if (!parsed.success) {
                        logger.warn('Login validation failed', { errors: parsed.error.errors })
                        return null
                    }

                    const { email, password } = parsed.data

                    const user = await prisma.user.findUnique({
                        where: { email },
                    })

                    if (!user) {
                        logger.warn('Login failed: user not found', { email })
                        return null
                    }

                    const isPasswordValid = await bcrypt.compare(password, user.password)

                    if (!isPasswordValid) {
                        logger.warn('Login failed: invalid password', { email })
                        return null
                    }

                    logger.info('User logged in successfully', { userId: user.id, email })

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                    }
                } catch (error) {
                    logger.error('Login error', { error })
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
