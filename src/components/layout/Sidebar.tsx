'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    LayoutDashboard,
    Users,
    FileText,
    MapPin,
    Package,
    Home,
    Tent,
    Settings,
    LogOut,
    AlertTriangle,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils' // Assuming you have a utils/cn or similar, if not I'll just use template literals but cn is standard in shadcn/tailwind projects. 
// I'll check if lib/utils exists, if not I will use template literals.

// Navigation Items Configuration
const NAV_ITEMS = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'KOORDINATOR', 'RELAWAN', 'RELAWAN_MEDIS', 'RELAWAN_LAPANGAN', 'MASYARAKAT', 'DONOR'],
    },
    {
        title: 'Peta Bencana',
        href: '/map',
        icon: MapPin,
        roles: ['ADMIN', 'KOORDINATOR', 'RELAWAN', 'RELAWAN_MEDIS', 'RELAWAN_LAPANGAN', 'MASYARAKAT', 'DONOR'],
    },
    {
        title: 'Laporan',
        href: '/reports', // You might usually have /reports for list
        icon: FileText,
        roles: ['ADMIN', 'KOORDINATOR', 'RELAWAN', 'RELAWAN_MEDIS', 'RELAWAN_LAPANGAN', 'MASYARAKAT'],
    },
    {
        title: 'Manajemen Akun',
        href: '/admin/users',
        icon: Users,
        roles: ['ADMIN'],
    },
    {
        title: 'Posko & Pengungsi',
        href: '/refugees',
        icon: Tent,
        roles: ['ADMIN', 'KOORDINATOR', 'RELAWAN', 'RELAWAN_MEDIS', 'RELAWAN_LAPANGAN'],
    },
    {
        title: 'Logistik',
        href: '/logistics',
        icon: Package,
        roles: ['ADMIN', 'KOORDINATOR'],
    },
]

interface SidebarProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen, collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const userRole = session?.user?.role || 'MASYARAKAT'

    // Filter nav items based on user role
    // Basic check: if item.roles includes userRole
    const filteredNavItems = NAV_ITEMS.filter(item =>
        item.roles.includes(userRole) || item.roles.includes('ALL')
    )

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
                    bg-slate-900 border-r border-slate-800 text-slate-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'w-20' : 'w-64'}
                `}
            >
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
                    {!collapsed && (
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
                            <AlertTriangle className="w-6 h-6 text-blue-500" />
                            <span>SITDB</span>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="mx-auto">
                            <AlertTriangle className="w-6 h-6 text-blue-500" />
                        </div>
                    )}

                    {/* Collapse Button (Desktop Only) */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    {/* Close Button (Mobile Only) */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-1 rounded-md hover:bg-slate-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="px-2 space-y-1">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'hover:bg-slate-800 hover:text-white'
                                        }
                                        ${collapsed ? 'justify-center' : ''}
                                    `}
                                    title={collapsed ? item.title : undefined}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />

                                    {!collapsed && (
                                        <span className="font-medium truncate">
                                            {item.title}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer / User Profile Summary (Optional) */}
                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>

                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate capitalize">
                                    {session?.user?.role?.toLowerCase().replace('_', ' ') || 'Guest'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}
