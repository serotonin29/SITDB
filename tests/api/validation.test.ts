import { registerSchema, loginSchema, createReportSchema, updateStatusSchema } from '@/lib/validation'

describe('Validation Schemas', () => {
    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                phone: '081234567890',
                role: 'MASYARAKAT',
            }

            const result = registerSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123',
                name: 'Test User',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '12345',
                name: 'Test User',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject short name', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'A',
            }

            const result = registerSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            }

            const result = loginSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject empty password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '',
            }

            const result = loginSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('createReportSchema', () => {
        it('should validate correct report data', () => {
            const validData = {
                type: 'BANJIR',
                title: 'Banjir di Jakarta',
                description: 'Banjir setinggi 1 meter di Jakarta Selatan',
                latitude: -6.2088,
                longitude: 106.8456,
                address: 'Jakarta Selatan',
                severity: 'BERAT',
            }

            const result = createReportSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid disaster type', () => {
            const invalidData = {
                type: 'INVALID_TYPE',
                title: 'Test Report',
                description: 'This is a test report description',
                latitude: -6.2088,
                longitude: 106.8456,
                severity: 'BERAT',
            }

            const result = createReportSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject short title', () => {
            const invalidData = {
                type: 'BANJIR',
                title: 'Test',
                description: 'This is a test report description that is long enough',
                latitude: -6.2088,
                longitude: 106.8456,
                severity: 'BERAT',
            }

            const result = createReportSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject short description', () => {
            const invalidData = {
                type: 'BANJIR',
                title: 'Test Report Title',
                description: 'Too short',
                latitude: -6.2088,
                longitude: 106.8456,
                severity: 'BERAT',
            }

            const result = createReportSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should reject invalid latitude', () => {
            const invalidData = {
                type: 'BANJIR',
                title: 'Test Report Title',
                description: 'This is a test report description',
                latitude: 100, // Invalid: should be between -90 and 90
                longitude: 106.8456,
                severity: 'BERAT',
            }

            const result = createReportSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })
    })

    describe('updateStatusSchema', () => {
        it('should validate correct status update', () => {
            const validData = {
                status: 'VERIFIED',
                notes: 'Laporan telah diverifikasi',
            }

            const result = updateStatusSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it('should reject invalid status', () => {
            const invalidData = {
                status: 'INVALID_STATUS',
            }

            const result = updateStatusSchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it('should allow status update without notes', () => {
            const validData = {
                status: 'IN_PROGRESS',
            }

            const result = updateStatusSchema.safeParse(validData)
            expect(result.success).toBe(true)
        })
    })
})
