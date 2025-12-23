import { CheckCircle2, Circle, Clock, XCircle, Shield } from 'lucide-react'

interface StatusEntry {
    id: string
    status: string
    notes: string | null
    createdAt: Date | string
    user: {
        id: string
        name: string
        role: string
    }
}

interface StatusTimelineProps {
    history: StatusEntry[]
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    PENDING: {
        icon: <Circle className="w-4 h-4" />,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
    },
    VERIFIED: {
        icon: <Shield className="w-4 h-4" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
    },
    IN_PROGRESS: {
        icon: <Clock className="w-4 h-4" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
    },
    RESOLVED: {
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
    },
    REJECTED: {
        icon: <XCircle className="w-4 h-4" />,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
    },
}

const statusLabels: Record<string, string> = {
    PENDING: 'Menunggu Verifikasi',
    VERIFIED: 'Terverifikasi',
    IN_PROGRESS: 'Sedang Ditangani',
    RESOLVED: 'Selesai',
    REJECTED: 'Ditolak',
}

const roleLabels: Record<string, string> = {
    MASYARAKAT: 'Pelapor',
    RELAWAN: 'Relawan',
    ADMIN: 'Admin',
}

export function StatusTimeline({ history }: StatusTimelineProps) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada riwayat status</p>
            </div>
        )
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {history.map((entry, idx) => {
                    const config = statusConfig[entry.status] || statusConfig.PENDING
                    const isLast = idx === history.length - 1
                    const date = new Date(entry.createdAt)

                    return (
                        <li key={entry.id}>
                            <div className="relative pb-8">
                                {/* Connecting line */}
                                {!isLast && (
                                    <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                    />
                                )}

                                <div className="relative flex space-x-3">
                                    {/* Icon */}
                                    <div>
                                        <span
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${config.bgColor} ${config.color}`}
                                        >
                                            {config.icon}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900">
                                                {statusLabels[entry.status]}
                                            </p>
                                            <time className="text-xs text-gray-500">
                                                {date.toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-0.5">
                                            oleh <span className="font-medium">{entry.user.name}</span>
                                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${entry.user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : entry.user.role === 'RELAWAN'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {roleLabels[entry.user.role]}
                                            </span>
                                        </p>

                                        {entry.notes && (
                                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-600">{entry.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default StatusTimeline
