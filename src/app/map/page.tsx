'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2, Filter, X } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import type { MapMarker, ReportWithUser } from '@/types'

const DisasterMap = dynamic(() => import('@/components/map/DisasterMap'), {
    ssr: false,
    loading: () => <div className="h-full bg-gray-100 animate-pulse" />,
})

const disasterTypes = [
    { value: '', label: 'Semua Jenis' },
    { value: 'BANJIR', label: 'Banjir' },
    { value: 'GEMPA', label: 'Gempa' },
    { value: 'KEBAKARAN', label: 'Kebakaran' },
    { value: 'LONGSOR', label: 'Longsor' },
    { value: 'TSUNAMI', label: 'Tsunami' },
    { value: 'ANGIN_TOPAN', label: 'Angin Topan' },
    { value: 'KEKERINGAN', label: 'Kekeringan' },
    { value: 'LAINNYA', label: 'Lainnya' },
]

const statusTypes = [
    { value: '', label: 'Semua Status' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'VERIFIED', label: 'Terverifikasi' },
    { value: 'IN_PROGRESS', label: 'Ditangani' },
    { value: 'RESOLVED', label: 'Selesai' },
    { value: 'REJECTED', label: 'Ditolak' },
]

export default function MapPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [markers, setMarkers] = useState<MapMarker[]>([])
    const [selectedReport, setSelectedReport] = useState<ReportWithUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({ type: '', status: '' })

    useEffect(() => {
        fetchReports()
    }, [filters])

    const fetchReports = async () => {
        try {
            const params = new URLSearchParams()
            params.set('limit', '100')
            if (filters.type) params.set('type', filters.type)
            if (filters.status) params.set('status', filters.status)

            const res = await fetch(`/api/reports?${params.toString()}`)
            const data = await res.json()

            if (data.success) {
                const mapMarkers: MapMarker[] = data.data.map((report: ReportWithUser) => ({
                    id: report.id,
                    latitude: report.latitude,
                    longitude: report.longitude,
                    type: report.type,
                    severity: report.severity,
                    status: report.status,
                    title: report.title,
                }))
                setMarkers(mapMarkers)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleMarkerClick = async (markerId: string) => {
        try {
            const res = await fetch(`/api/reports/${markerId}`)
            const data = await res.json()
            if (data.success) {
                setSelectedReport(data.data)
            }
        } catch (error) {
            console.error('Error fetching report:', error)
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 relative">
                {/* Map */}
                <div className="absolute inset-0">
                    <DisasterMap
                        markers={markers}
                        onMarkerClick={handleMarkerClick}
                        className="h-full"
                    />
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="absolute top-4 left-4 z-[1000] bg-white shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                    <Filter className="w-5 h-5" />
                    Filter
                    {(filters.type || filters.status) && (
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                </button>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="absolute top-16 left-4 z-[1000] bg-white shadow-lg rounded-xl p-4 w-64">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Filter</h3>
                            <button onClick={() => setShowFilters(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Bencana
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {disasterTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {statusTypes.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => setFilters({ type: '', status: '' })}
                                className="w-full text-sm text-primary-600 hover:text-primary-700"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                )}

                {/* Selected Report Panel */}
                {selectedReport && (
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000] bg-white shadow-lg rounded-xl p-4">
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="absolute top-3 right-3"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        </button>

                        <div className="pr-8">
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                {selectedReport.type.replace('_', ' ')}
                            </span>
                            <h3 className="font-semibold text-gray-900 mt-1">
                                {selectedReport.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                {selectedReport.description}
                            </p>

                            <div className="flex items-center gap-2 mt-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedReport.severity === 'KRITIS' ? 'bg-red-100 text-red-800' :
                                        selectedReport.severity === 'BERAT' ? 'bg-orange-100 text-orange-800' :
                                            selectedReport.severity === 'SEDANG' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                    }`}>
                                    {selectedReport.severity}
                                </span>
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {selectedReport.status.replace('_', ' ')}
                                </span>
                            </div>

                            <button
                                onClick={() => router.push(`/reports/${selectedReport.id}`)}
                                className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 z-[1000] bg-white shadow-lg rounded-lg p-3 hidden md:block">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Legenda</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Banjir</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Gempa</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span>Kebakaran</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Longsor</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-lg px-4 py-2">
                    <span className="text-sm font-medium text-gray-700">
                        {markers.length} Laporan
                    </span>
                </div>
            </main>
        </div>
    )
}
