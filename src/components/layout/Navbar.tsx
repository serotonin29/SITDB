'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
    Menu,
    X,
    MapPin,
    AlertTriangle,
    LayoutDashboard,
    Users,
    LogOut,
    LogIn,
    UserPlus
} from 'lucide-react'

export function Navbar() {
    const { data: session, status } = useSession()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isAdmin = session?.user?.role === 'ADMIN'
    const isRelawan = session?.user?.role === 'RELAWAN'

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <AlertTriangle className="h-8 w-8 text-warning-400" />
                            <span className="text-xl font-bold">SITDB</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/map"
                            className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                        >
                            <MapPin className="h-4 w-4" />
                            <span>Peta</span>
                        </Link>

                        {session && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href="/reports/new"
                                    className="flex items-center space-x-1 px-3 py-2 bg-warning-500 hover:bg-warning-600 rounded-md transition-colors font-semibold"
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>Laporkan</span>
                                </Link>

                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Admin</span>
                                    </Link>
                                )}
                            </>
                        )}

                        {status === 'loading' ? (
                            <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                        ) : session ? (
                            <div className="flex items-center space-x-3">
                                <div className="text-sm">
                                    <p className="font-semibold">{session.user?.name}</p>
                                    <p className="text-xs text-white/70 capitalize">
                                        {session.user?.role?.toLowerCase()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="p-2 rounded-md hover:bg-white/10 transition-colors"
                                    title="Keluar"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                >
                                    <LogIn className="h-4 w-4" />
                                    <span>Masuk</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center space-x-1 px-3 py-2 bg-white text-primary-600 rounded-md hover:bg-white/90 transition-colors font-semibold"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>Daftar</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md hover:bg-white/10 transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-primary-700 border-t border-white/10">
                    <div className="px-4 py-3 space-y-2">
                        <Link
                            href="/map"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <MapPin className="h-5 w-5" />
                            <span>Peta Bencana</span>
                        </Link>

                        {session && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href="/reports/new"
                                    className="flex items-center space-x-2 px-3 py-2 bg-warning-500 rounded-md transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <AlertTriangle className="h-5 w-5" />
                                    <span>Laporkan Bencana</span>
                                </Link>

                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Users className="h-5 w-5" />
                                        <span>Admin Panel</span>
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        signOut({ callbackUrl: '/' })
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 w-full text-left rounded-md hover:bg-white/10 transition-colors text-red-300"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Keluar</span>
                                </button>
                            </>
                        )}

                        {!session && (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <LogIn className="h-5 w-5" />
                                    <span>Masuk</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center space-x-2 px-3 py-2 bg-white text-primary-600 rounded-md transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <UserPlus className="h-5 w-5" />
                                    <span>Daftar</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
