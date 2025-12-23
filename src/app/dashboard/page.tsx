'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    AlertTriangle,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Loader2,
    Plus,
    MapPin
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { ReportCard } from '@/components/reports/ReportCard'
import type { ReportWithUser, DashboardStats } from '@/types'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [reports, setReports] = useState<ReportWithUser[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user) {
            fetchData()
        }
    }, [session])

    const fetchData = async () => {
        try {
            // Fetch reports
            const reportsRes = await fetch('/api/reports?limit=6')
            const reportsData = await reportsRes.json()
            if (reportsData.success) {
                setReports(reportsData.data)
            }

            // Fetch stats if admin
            if (session?.user?.role === 'ADMIN') {
                const statsRes = await fetch('/api/admin/stats')
                const statsData = await statsRes.json()
                if (statsData.success) {
                    setStats(statsData.data)
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </div>
        )
    }

    const isAdmin = session?.user?.role === 'ADMIN'
    const isRelawan = session?.user?.role === 'RELAWAN'

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Selamat datang, {session?.user?.name}!
                        </h1>
                        <p className="text-gray-600">
                            {isAdmin && 'Dashboard Admin SITDB'}
                            {isRelawan && 'Dashboard Relawan'}
                            {!isAdmin && !isRelawan && 'Pantau laporan bencana Anda'}
                        </p>
                    </div>
                    <Link
                        href="/reports/new"
                        className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-danger-500 hover:bg-danger-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Buat Laporan</span>
                    </Link>
                </div>

                {/* Admin Stats */}
                {isAdmin && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Laporan</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
                                </div>
                                <div className="p-3 bg-primary-100 rounded-full">
                                    <FileText className="w-6 h-6 text-primary-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Menunggu</p>
                                    <p className="text-3xl font-bold text-warning-600">{stats.pendingReports}</p>
                                </div>
                                <div className="p-3 bg-warning-100 rounded-full">
                                    <Clock className="w-6 h-6 text-warning-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Ditangani</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.inProgressReports}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Selesai</p>
                                    <p className="text-3xl font-bold text-success-600">{stats.resolvedReports}</p>
                                </div>
                                <div className="p-3 bg-success-100 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-success-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Link
                        href="/map"
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                    >
                        <MapPin className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Peta Bencana</h3>
                        <p className="text-primary-100 text-sm">Lihat semua laporan di peta</p>
                    </Link>

                    <Link
                        href="/reports/new"
                        className="bg-gradient-to-r from-danger-500 to-danger-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                    >
                        <AlertTriangle className="w-8 h-8 mb-3" />
                        <h3 className="font-semibold text-lg">Laporkan Bencana</h3>
                        <p className="text-danger-100 text-sm">Buat laporan baru</p>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-shadow"
                        >
                            <TrendingUp className="w-8 h-8 mb-3" />
                            <h3 className="font-semibold text-lg">Admin Panel</h3>
                            <p className="text-purple-100 text-sm">Kelola sistem</p>
                        </Link>
                    )}
                </div>

                {/* Recent Reports */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Laporan Terbaru</h2>
                        <Link href="/map" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Lihat semua →
                        </Link>
                    </div>

                    {reports.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada laporan</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
