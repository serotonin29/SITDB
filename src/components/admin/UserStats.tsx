'use client'

import { Users, UserCheck, UserPlus } from 'lucide-react'

export function UserStats() {
    // Mock data - later fetching from API
    const stats = [
        {
            label: 'Total Pengguna',
            value: '1,234',
            change: '+12%',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Relawan Aktif',
            value: '856',
            change: '+5%',
            icon: UserCheck,
            color: 'bg-green-500',
        },
        {
            label: 'Menunggu Verifikasi',
            value: '12',
            change: '-2', // Decreased
            icon: UserPlus,
            color: 'bg-yellow-500',
            alert: true,
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-slate-500">bulan ini</span>
                        </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-white`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} bg-opacity-20`}>
                            <stat.icon className={`w-6 h-6 ${stat.alert ? 'text-yellow-400' : 'text-current'}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
