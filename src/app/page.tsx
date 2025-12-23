import Link from 'next/link'
import { AlertTriangle, MapPin, Users, Shield, ArrowRight, Clock } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

                <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
                    <div className="text-center">
                        {/* Alert Badge */}
                        <div className="inline-flex items-center gap-2 bg-danger-500/20 border border-danger-500/30 text-danger-300 px-4 py-2 rounded-full text-sm mb-8 animate-pulse">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Sistem Tanggap Darurat Bencana 24/7</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400">
                                SITDB
                            </span>
                            <br />
                            <span className="text-3xl md:text-5xl text-white/90">
                                Sistem Informasi Tanggap Darurat Bencana
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
                            Platform pelaporan dan koordinasi tanggap darurat bencana berbasis peta
                            dengan pembaruan realtime untuk respons cepat dan terkoordinasi.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/reports/new"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-danger-500/30 hover:shadow-danger-500/50"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                Laporkan Bencana
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/map"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all border border-white/20"
                            >
                                <MapPin className="w-5 h-5" />
                                Lihat Peta Bencana
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Fitur Utama
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Sistem terintegrasi untuk koordinasi tanggap darurat yang efektif
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Pelaporan Berbasis Peta
                            </h3>
                            <p className="text-gray-400">
                                Laporkan bencana dengan lokasi GPS akurat langsung dari perangkat Anda.
                                Sistem akan menampilkan laporan pada peta interaktif.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-warning-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-warning-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Pembaruan Realtime
                            </h3>
                            <p className="text-gray-400">
                                Pantau status laporan secara realtime. Notifikasi langsung saat ada
                                laporan baru atau perubahan status.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-success-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-success-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Koordinasi Tim
                            </h3>
                            <p className="text-gray-400">
                                Sistem role-based untuk masyarakat, relawan, dan admin.
                                Koordinasi efektif antara semua pihak terkait.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-2">24/7</div>
                            <div className="text-gray-400">Layanan Aktif</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary-400 mb-2">8</div>
                            <div className="text-gray-400">Jenis Bencana</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-warning-400 mb-2">Real-time</div>
                            <div className="text-gray-400">Pembaruan Status</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-success-400 mb-2">100%</div>
                            <div className="text-gray-400">Gratis</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles Section */}
            <section className="py-20 bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Untuk Siapa SITDB?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Masyarakat</h3>
                            <p className="text-gray-400">
                                Laporkan bencana di sekitar Anda dan pantau status penanganan.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Relawan</h3>
                            <p className="text-gray-400">
                                Verifikasi laporan dan koordinasikan penanganan di lapangan.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Admin BPBD</h3>
                            <p className="text-gray-400">
                                Kelola seluruh laporan, pengguna, dan lihat statistik lengkap.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                    <p>© 2024 SITDB - Sistem Informasi Tanggap Darurat Bencana</p>
                    <p className="text-sm mt-2">
                        Dibuat untuk membantu koordinasi tanggap darurat bencana di Indonesia
                    </p>
                </div>
            </footer>
        </div>
    )
}
