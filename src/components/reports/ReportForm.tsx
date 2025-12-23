'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle, Loader2 } from 'lucide-react'

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    ),
})

const disasterTypes = [
    { value: 'BANJIR', label: 'Banjir', emoji: '🌊' },
    { value: 'GEMPA', label: 'Gempa Bumi', emoji: '🏚️' },
    { value: 'KEBAKARAN', label: 'Kebakaran', emoji: '🔥' },
    { value: 'LONGSOR', label: 'Tanah Longsor', emoji: '⛰️' },
    { value: 'TSUNAMI', label: 'Tsunami', emoji: '🌊' },
    { value: 'ANGIN_TOPAN', label: 'Angin Topan', emoji: '🌪️' },
    { value: 'KEKERINGAN', label: 'Kekeringan', emoji: '☀️' },
    { value: 'LAINNYA', label: 'Lainnya', emoji: '❓' },
]

const severityLevels = [
    { value: 'RINGAN', label: 'Ringan', color: 'bg-green-500', description: 'Kerusakan minimal, tidak ada korban' },
    { value: 'SEDANG', label: 'Sedang', color: 'bg-yellow-500', description: 'Kerusakan moderat, beberapa korban luka' },
    { value: 'BERAT', label: 'Berat', color: 'bg-orange-500', description: 'Kerusakan besar, banyak korban' },
    { value: 'KRITIS', label: 'Kritis', color: 'bg-red-500', description: 'Situasi darurat, butuh bantuan segera' },
]

export function ReportForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        type: '',
        title: '',
        description: '',
        severity: '',
        latitude: 0,
        longitude: 0,
        address: '',
    })

    const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>()

    const handleLocationChange = (loc: { lat: number; lng: number; address?: string }) => {
        setLocation({ lat: loc.lat, lng: loc.lng })
        setFormData(prev => ({
            ...prev,
            latitude: loc.lat,
            longitude: loc.lng,
            address: loc.address || '',
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Validation
        if (!formData.type) {
            setError('Pilih jenis bencana')
            return
        }
        if (!formData.title || formData.title.length < 5) {
            setError('Judul minimal 5 karakter')
            return
        }
        if (!formData.description || formData.description.length < 20) {
            setError('Deskripsi minimal 20 karakter')
            return
        }
        if (!formData.severity) {
            setError('Pilih tingkat keparahan')
            return
        }
        if (!location) {
            setError('Pilih lokasi pada peta')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Gagal membuat laporan')
            }

            router.push(`/reports/${result.data.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Disaster Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Bencana *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {disasterTypes.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                            className={`p-3 rounded-lg border-2 transition-all text-center ${formData.type === type.value
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <span className="text-2xl block mb-1">{type.emoji}</span>
                            <span className="text-sm font-medium">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Laporan *
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Banjir di Jl. Sudirman"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    maxLength={200}
                />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Detail *
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan kondisi bencana, kerusakan, korban, kebutuhan bantuan, dll."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 karakter</p>
            </div>

            {/* Severity */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Keparahan *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {severityLevels.map((level) => (
                        <button
                            key={level.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${formData.severity === level.value
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                                <span className="font-medium text-sm">{level.label}</span>
                            </div>
                            <p className="text-xs text-gray-500">{level.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokasi Bencana *
                </label>
                <LocationPicker value={location} onChange={handleLocationChange} />
                {formData.address && (
                    <p className="text-sm text-gray-600 mt-2">
                        📍 {formData.address}
                    </p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-danger-500 to-danger-600 text-white py-4 rounded-lg font-semibold hover:from-danger-600 hover:to-danger-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Mengirim...</span>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="w-5 h-5" />
                        <span>Kirim Laporan Bencana</span>
                    </>
                )}
            </button>
        </form>
    )
}

export default ReportForm
