'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
    AlertTriangle,
    ArrowLeft,
    MapPin,
    Clock,
    User,
    Loader2,
    CheckCircle,
    XCircle,
    Send
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { StatusTimeline } from '@/components/reports/StatusTimeline'
import type { ReportDetail } from '@/types'

const DisasterMap = dynamic(() => import('@/components/map/DisasterMap'), {
    ssr: false,
    loading: () => <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />,
})

const severityColors: Record<string, string> = {
    RINGAN: 'bg-green-100 text-green-800 border-green-300',
    SEDANG: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    BERAT: 'bg-orange-100 text-orange-800 border-orange-300',
    KRITIS: 'bg-red-100 text-red-800 border-red-300',
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    VERIFIED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
}

const statusOptions = [
    { value: 'VERIFIED', label: 'Terverifikasi', icon: CheckCircle, color: 'text-blue-600' },
    { value: 'IN_PROGRESS', label: 'Sedang Ditangani', icon: Clock, color: 'text-yellow-600' },
    { value: 'RESOLVED', label: 'Selesai', icon: CheckCircle, color: 'text-green-600' },
    { value: 'REJECTED', label: 'Ditolak', icon: XCircle, color: 'text-red-600' },
]

export default function ReportDetailPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const [report, setReport] = useState<ReportDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [statusForm, setStatusForm] = useState({ status: '', notes: '' })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    useEffect(() => {
        if (session?.user && params.id) {
            fetchReport()
        }
    }, [session, params.id])

    const fetchReport = async () => {
        try {
            const res = await fetch(`/api/reports/${params.id}`)
            const data = await res.json()
            if (data.success) {
                setReport(data.data)
            }
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!statusForm.status) return

        setIsUpdating(true)
        try {
            const res = await fetch(`/api/reports/${params.id}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(statusForm),
            })
            const data = await res.json()
            if (data.success) {
                fetchReport()
                setStatusForm({ status: '', notes: '' })
            }
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setIsUpdating(false)
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

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">Laporan tidak ditemukan</p>
                    <Link href="/dashboard" className="text-primary-600 hover:underline mt-2">
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    const canUpdateStatus = session?.user?.role === 'ADMIN' || session?.user?.role === 'RELAWAN'
    const formattedDate = new Date(report.createdAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm text-gray-500 uppercase tracking-wide">
                                        {report.type.replace('_', ' ')}
                                    </span>
                                    <h1 className="text-2xl font-bold text-gray-900 mt-1">
                                        {report.title}
                                    </h1>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status]}`}>
                                    {report.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                <span className={`px-2 py-1 rounded border ${severityColors[report.severity]}`}>
                                    {report.severity}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formattedDate}
                                </span>
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {report.user.name}
                                </span>
                            </div>

                            <p className="text-gray-700 whitespace-pre-wrap">
                                {report.description}
                            </p>

                            {report.address && (
                                <div className="mt-4 flex items-start gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span className="text-sm">{report.address}</span>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Lokasi Bencana</h2>
                            <DisasterMap
                                markers={[{
                                    id: report.id,
                                    latitude: report.latitude,
                                    longitude: report.longitude,
                                    type: report.type,
                                    severity: report.severity,
                                    status: report.status,
                                    title: report.title,
                                }]}
                                center={[report.latitude, report.longitude]}
                                zoom={14}
                                className="h-[300px]"
                            />
                        </div>

                        {/* Status Update Form (for relawan/admin) */}
                        {canUpdateStatus && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setStatusForm(prev => ({ ...prev, status: option.value }))}
                                                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 ${statusForm.status === option.value
                                                        ? 'border-primary-500 bg-primary-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <option.icon className={`w-4 h-4 ${option.color}`} />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={statusForm.notes}
                                        onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Catatan tambahan (opsional)"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                    />

                                    <button
                                        type="submit"
                                        disabled={!statusForm.status || isUpdating}
                                        className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        Update Status
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Status Timeline */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="font-semibold text-gray-900 mb-4">Riwayat Status</h2>
                            <StatusTimeline history={report.statusHistory} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
