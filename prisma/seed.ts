import { PrismaClient, UserRole, DisasterType, SeverityLevel, ReportStatusType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sitdb.id' },
        update: {},
        create: {
            email: 'admin@sitdb.id',
            password: adminPassword,
            name: 'Administrator SITDB',
            phone: '081234567890',
            role: UserRole.ADMIN,
        },
    })
    console.log('✅ Created admin user:', admin.email)

    // Create relawan user
    const relawanPassword = await bcrypt.hash('relawan123', 10)
    const relawan = await prisma.user.upsert({
        where: { email: 'relawan@sitdb.id' },
        update: {},
        create: {
            email: 'relawan@sitdb.id',
            password: relawanPassword,
            name: 'Relawan PMI',
            phone: '081234567891',
            role: UserRole.RELAWAN,
        },
    })
    console.log('✅ Created relawan user:', relawan.email)

    // Create masyarakat user
    const masyarakatPassword = await bcrypt.hash('masyarakat123', 10)
    const masyarakat = await prisma.user.upsert({
        where: { email: 'warga@sitdb.id' },
        update: {},
        create: {
            email: 'warga@sitdb.id',
            password: masyarakatPassword,
            name: 'Warga Masyarakat',
            phone: '081234567892',
            role: UserRole.MASYARAKAT,
        },
    })
    console.log('✅ Created masyarakat user:', masyarakat.email)

    // Create sample disaster reports
    const sampleReports = [
        {
            userId: masyarakat.id,
            type: DisasterType.BANJIR,
            title: 'Banjir di Kelurahan Kebon Jeruk',
            description: 'Air setinggi 1 meter sudah masuk ke pemukiman warga. Dibutuhkan bantuan evakuasi segera.',
            latitude: -6.1884,
            longitude: 106.7754,
            address: 'Jl. Kebon Jeruk Raya No. 45, Jakarta Barat',
            severity: SeverityLevel.BERAT,
            status: ReportStatusType.VERIFIED,
        },
        {
            userId: masyarakat.id,
            type: DisasterType.LONGSOR,
            title: 'Longsor di Bukit Cikutra',
            description: 'Tebing setinggi 10m longsor menutupi jalan akses desa. Tidak ada korban jiwa.',
            latitude: -6.9175,
            longitude: 107.6191,
            address: 'Jl. Cikutra Atas, Bandung',
            severity: SeverityLevel.SEDANG,
            status: ReportStatusType.IN_PROGRESS,
        },
        {
            userId: masyarakat.id,
            type: DisasterType.KEBAKARAN,
            title: 'Kebakaran Pasar Tradisional',
            description: 'Kebakaran melanda 5 kios di pasar tradisional. Api sudah berhasil dipadamkan.',
            latitude: -7.2504,
            longitude: 112.7688,
            address: 'Pasar Wonokromo, Surabaya',
            severity: SeverityLevel.RINGAN,
            status: ReportStatusType.RESOLVED,
        },
        {
            userId: masyarakat.id,
            type: DisasterType.GEMPA,
            title: 'Gempa 5.5 SR Merusak Bangunan',
            description: 'Gempa bumi berkekuatan 5.5 SR mengakibatkan beberapa bangunan retak. Warga panik dan mengungsi.',
            latitude: -0.9493,
            longitude: 100.3543,
            address: 'Kota Padang, Sumatera Barat',
            severity: SeverityLevel.KRITIS,
            status: ReportStatusType.PENDING,
        },
    ]

    for (const report of sampleReports) {
        const created = await prisma.disasterReport.create({
            data: report,
        })

        // Create initial status history
        await prisma.reportStatus.create({
            data: {
                reportId: created.id,
                userId: report.status === ReportStatusType.PENDING ? masyarakat.id : relawan.id,
                status: report.status,
                notes: 'Status awal laporan',
            },
        })

        console.log('✅ Created report:', created.title)
    }

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
