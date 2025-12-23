import Link from 'next/link'
import {
    MapPin,
    Clock,
    AlertTriangle,
    Droplets,
    Flame,
    Mountain,
    Waves,
    Wind,
    Sun,
    HelpCircle
} from 'lucide-react'
import type { ReportWithUser } from '@/types'

const disasterIcons: Record<string, React.ReactNode> = {
    BANJIR: <Droplets className="w-5 h-5 text-blue-500" />,
    GEMPA: <AlertTriangle className="w-5 h-5 text-red-500" />,
    KEBAKARAN: <Flame className="w-5 h-5 text-orange-500" />,
    LONGSOR: <Mountain className="w-5 h-5 text-green-600" />,
    TSUNAMI: <Waves className="w-5 h-5 text-cyan-500" />,
    ANGIN_TOPAN: <Wind className="w-5 h-5 text-purple-500" />,
    KEKERINGAN: <Sun className="w-5 h-5 text-yellow-500" />,
    LAINNYA: <HelpCircle className="w-5 h-5 text-gray-500" />,
}

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

const statusLabels: Record<string, string> = {
    PENDING: 'Menunggu',
    VERIFIED: 'Terverifikasi',
    IN_PROGRESS: 'Ditangani',
    RESOLVED: 'Selesai',
    REJECTED: 'Ditolak',
}

interface ReportCardProps {
    report: ReportWithUser
    showUser?: boolean
}

export function ReportCard({ report, showUser = true }: ReportCardProps) {
    const formattedDate = new Date(report.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <Link href={`/reports/${report.id}`}>
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                {disasterIcons[report.type]}
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    {report.type.replace('_', ' ')}
                                </span>
                                <h3 className="font-semibold text-gray-900 line-clamp-1">
                                    {report.title}
                                </h3>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            {statusLabels[report.status]}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {report.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-3">
                            {report.address && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="line-clamp-1 max-w-[150px]">{report.address}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formattedDate}
                            </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-xs font-medium ${severityColors[report.severity]}`}>
                            {report.severity}
                        </span>
                    </div>

                    {/* Reporter */}
                    {showUser && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary-600">
                                    {report.user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-xs text-gray-600">
                                Dilaporkan oleh <strong>{report.user.name}</strong>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ReportCard
