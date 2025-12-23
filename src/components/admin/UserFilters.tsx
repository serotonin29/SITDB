'use client'

import { Search, Filter, RotateCcw } from 'lucide-react'
import { UserRole, UserStatus } from '@prisma/client'

interface UserFiltersProps {
    search: string
    setSearch: (val: string) => void
    roleFilter: string
    setRoleFilter: (val: string) => void
    statusFilter: string
    setStatusFilter: (val: string) => void
    onReset: () => void
}

export function UserFilters({
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    onReset
}: UserFiltersProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">

            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">

                {/* Role Filter */}
                <div className="relative">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="">Semua Peran</option>
                        {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>{role.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                        <option value="">Semua Status</option>
                        {Object.values(UserStatus).map((status) => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>
            </div>
        </div>
    )
}
