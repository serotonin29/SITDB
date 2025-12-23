'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    FileText,
    Shield,
    TrendingUp,
    Loader2,
    UserCog,
    Search,
    ChevronDown,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { UserFilters } from '@/components/admin/UserFilters'
import { UserStatus } from '@prisma/client'
import type { DashboardStats } from '@/types'

interface UserData {
    id: string
    email: string
    name: string
    phone: string | null

    role: string
    status: UserStatus
    createdAt: string
    _count: {
        reports: number
        statusUpdates: number
    }
}

export default function AdminPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [users, setUsers] = useState<UserData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }
        if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [status, session, router])

    useEffect(() => {
        if (session?.user?.role === 'ADMIN') {
            fetchData()
        }
    }, [session, roleFilter, statusFilter, searchQuery])

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch(`/api/admin/users?limit=50&role=${roleFilter}&status=${statusFilter}&search=${searchQuery}`),
            ])

            const statsData = await statsRes.json()
            const usersData = await usersRes.json()

            if (statsData.success) setStats(statsData.data)
            if (usersData.success) setUsers(usersData.data)
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            })
            const data = await res.json()
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
                // Refresh stats
                fetchData()
            }
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status: newStatus }),
            })
            const data = await res.json()
            if (data.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as UserStatus } : u))
                // Refresh stats
                fetchData()
            }
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleResetFilters = () => {
        setSearchQuery('')
        setRoleFilter('')
        setStatusFilter('')
    }

    // Client-side filtering is no longer needed as we do server-side filtering
    // But we keep the users state updated
    const filteredUsers = users

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
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-gray-600">Kelola sistem SITDB</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Pengguna
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                        <p className="text-sm text-gray-500">Total Pengguna</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Relawan</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalRelawan}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Shield className="w-6 h-6 text-green-600" />
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
                                        <TrendingUp className="w-6 h-6 text-warning-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Reports by Type */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Laporan per Jenis</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.reportsByType).map(([type, count]) => (
                                        <div key={type} className="flex items-center gap-3">
                                            <div className="w-24 text-sm text-gray-600">{type}</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-4">
                                                <div
                                                    className="bg-primary-500 h-4 rounded-full"
                                                    style={{ width: `${(count / stats.totalReports) * 100}%` }}
                                                />
                                            </div>
                                            <div className="w-8 text-sm text-gray-900 font-medium">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reports by Severity */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="font-semibold text-gray-900 mb-4">Laporan per Tingkat</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.reportsBySeverity).map(([severity, count]) => {
                                        const colors: Record<string, string> = {
                                            RINGAN: 'bg-green-500',
                                            SEDANG: 'bg-yellow-500',
                                            BERAT: 'bg-orange-500',
                                            KRITIS: 'bg-red-500',
                                        }
                                        return (
                                            <div key={severity} className="flex items-center gap-3">
                                                <div className="w-24 text-sm text-gray-600">{severity}</div>
                                                <div className="flex-1 bg-gray-100 rounded-full h-4">
                                                    <div
                                                        className={`h-4 rounded-full ${colors[severity] || 'bg-gray-500'}`}
                                                        style={{ width: `${(count / stats.totalReports) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="w-8 text-sm text-gray-900 font-medium">{count}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        {/* Search & Filter */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <UserFilters
                                search={searchQuery}
                                setSearch={setSearchQuery}
                                roleFilter={roleFilter}
                                setRoleFilter={setRoleFilter}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                onReset={handleResetFilters}
                            />
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pengguna
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Laporan
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Terdaftar
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'RELAWAN' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={user.status}
                                                        onChange={(e) => handleStatusUpdate(user.id, e.target.value)}
                                                        className={`appearance-none rounded px-2 py-1 pr-6 text-xs font-medium border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                            user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                user.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {Object.values(UserStatus).map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {user._count.reports} laporan
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                        className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    >
                                                        <option value="MASYARAKAT">Masyarakat</option>
                                                        <option value="RELAWAN">Relawan</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                Tidak ada pengguna ditemukan
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
