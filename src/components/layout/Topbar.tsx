'use client'

import { useSession, signOut } from 'next-auth/react'
import { Menu, Bell, Search, User, LogOut, Moon, Sun, Settings } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface TopbarProps {
    setSidebarOpen: (open: boolean) => void
    breadcrumbs?: { label: string; href?: string }[]
}

export function Topbar({ setSidebarOpen, breadcrumbs = [] }: TopbarProps) {
    const { data: session } = useSession()
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
            {/* Left: Hamburger & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <nav className="hidden sm:flex items-center text-sm font-medium text-slate-400">
                    <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                        Beranda
                    </Link>
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center">
                            <span className="mx-2 text-slate-600">/</span>
                            {crumb.href ? (
                                <Link href={crumb.href} className="hover:text-blue-400 transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-slate-200">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Search Bar (Hidden on mobile) */}
                <div className="hidden md:flex items-center relative">
                    <Search className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Cari..."
                        className="bg-slate-950 border border-slate-800 text-sm rounded-full pl-9 pr-4 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-300 placeholder:text-slate-600"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
                    >
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                        <span className="hidden sm:block text-sm font-medium text-slate-300 pr-2">
                            {session?.user?.name?.split(' ')[0]}
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsProfileMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                                <div className="px-4 py-2 border-b border-slate-800">
                                    <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                                </div>
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
                                >
                                    <User className="w-4 h-4" />
                                    Profile
                                </Link>
                                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </button>
                                <div className="border-t border-slate-800 my-1"></div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
