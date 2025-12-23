'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { ReportForm } from '@/components/reports/ReportForm'

export default function NewReportPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
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

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-4">
                        <AlertTriangle className="w-8 h-8 text-danger-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporkan Bencana</h1>
                    <p className="text-gray-600 mt-2">
                        Isi formulir berikut untuk melaporkan kejadian bencana di sekitar Anda
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <ReportForm />
                </div>

                {/* Tips */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">💡 Tips Pelaporan</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Pastikan lokasi yang ditandai akurat</li>
                        <li>• Berikan deskripsi sejelas mungkin</li>
                        <li>• Sebutkan jika ada korban atau kebutuhan mendesak</li>
                        <li>• Lampirkan foto jika memungkinkan</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}
