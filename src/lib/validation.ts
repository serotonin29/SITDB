import { z } from 'zod'

// ============================================
// USER SCHEMAS
// ============================================

export const registerSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    phone: z.string().optional(),
    role: z.enum(['MASYARAKAT', 'RELAWAN']).default('MASYARAKAT'),
})

export const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
})

export const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    role: z.enum(['MASYARAKAT', 'RELAWAN', 'ADMIN']).optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED']).optional(),
})

// ============================================
// DISASTER REPORT SCHEMAS
// ============================================

export const disasterTypeEnum = z.enum([
    'BANJIR',
    'GEMPA',
    'KEBAKARAN',
    'LONGSOR',
    'TSUNAMI',
    'ANGIN_TOPAN',
    'KEKERINGAN',
    'LAINNYA',
])

export const severityEnum = z.enum(['RINGAN', 'SEDANG', 'BERAT', 'KRITIS'])

export const reportStatusEnum = z.enum([
    'PENDING',
    'VERIFIED',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
])

export const createReportSchema = z.object({
    type: disasterTypeEnum,
    title: z.string().min(5, 'Judul minimal 5 karakter').max(200),
    description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    severity: severityEnum,
})

export const updateReportSchema = z.object({
    type: disasterTypeEnum.optional(),
    title: z.string().min(5).max(200).optional(),
    description: z.string().min(20).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().optional(),
    severity: severityEnum.optional(),
})

export const updateStatusSchema = z.object({
    status: reportStatusEnum,
    notes: z.string().optional(),
})

// ============================================
// QUERY SCHEMAS
// ============================================

export const reportQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    status: reportStatusEnum.optional(),
    type: disasterTypeEnum.optional(),
    severity: severityEnum.optional(),
    search: z.string().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().optional(), // in km
    sortBy: z.enum(['createdAt', 'severity', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
export type ReportQueryInput = z.infer<typeof reportQuerySchema>
