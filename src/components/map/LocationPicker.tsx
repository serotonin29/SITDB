'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'

interface LocationPickerProps {
    value?: { lat: number; lng: number }
    onChange: (location: { lat: number; lng: number; address?: string }) => void
    className?: string
}

export function LocationPicker({ value, onChange, className = 'h-[300px]' }: LocationPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const markerRef = useRef<L.Marker | null>(null)
    const [isLocating, setIsLocating] = useState(false)

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        const initialCenter: [number, number] = value
            ? [value.lat, value.lng]
            : [-6.2088, 106.8456] // Jakarta default

        const map = L.map(mapRef.current).setView(initialCenter, 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map)

        // Create default marker icon
        const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        })

        // Add initial marker if value exists
        if (value) {
            markerRef.current = L.marker([value.lat, value.lng], {
                icon: defaultIcon,
                draggable: true
            }).addTo(map)

            markerRef.current.on('dragend', async () => {
                const pos = markerRef.current?.getLatLng()
                if (pos) {
                    const address = await reverseGeocode(pos.lat, pos.lng)
                    onChange({ lat: pos.lat, lng: pos.lng, address })
                }
            })
        }

        // Click to place/move marker
        map.on('click', async (e) => {
            const { lat, lng } = e.latlng

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng])
            } else {
                markerRef.current = L.marker([lat, lng], {
                    icon: defaultIcon,
                    draggable: true
                }).addTo(map)

                markerRef.current.on('dragend', async () => {
                    const pos = markerRef.current?.getLatLng()
                    if (pos) {
                        const address = await reverseGeocode(pos.lat, pos.lng)
                        onChange({ lat: pos.lat, lng: pos.lng, address })
                    }
                })
            }

            const address = await reverseGeocode(lat, lng)
            onChange({ lat, lng, address })
        })

        mapInstanceRef.current = map

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Update marker when value changes externally
    useEffect(() => {
        if (value && mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([value.lat, value.lng])
            mapInstanceRef.current.setView([value.lat, value.lng], 15)
        }
    }, [value])

    const reverseGeocode = async (lat: number, lng: number): Promise<string | undefined> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            )
            const data = await response.json()
            return data.display_name
        } catch {
            return undefined
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung oleh browser Anda')
            return
        }

        setIsLocating(true)

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 15)

                    const defaultIcon = L.icon({
                        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                    })

                    if (markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude])
                    } else {
                        markerRef.current = L.marker([latitude, longitude], {
                            icon: defaultIcon,
                            draggable: true,
                        }).addTo(mapInstanceRef.current)
                    }
                }

                const address = await reverseGeocode(latitude, longitude)
                onChange({ lat: latitude, lng: longitude, address })
                setIsLocating(false)
            },
            (error) => {
                console.error('Error getting location:', error)
                alert('Gagal mendapatkan lokasi. Pastikan GPS aktif.')
                setIsLocating(false)
            },
            { enableHighAccuracy: true }
        )
    }

    return (
        <div className="relative">
            <div ref={mapRef} className={`rounded-lg border border-gray-300 ${className}`} />

            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLocating}
                    className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Gunakan lokasi saat ini"
                >
                    {isLocating ? (
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Navigation className="w-5 h-5 text-primary-600" />
                    )}
                </button>
            </div>

            <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md text-sm text-gray-600">
                <MapPin className="inline w-4 h-4 mr-1" />
                {value ? (
                    <span>{value.lat.toFixed(4)}, {value.lng.toFixed(4)}</span>
                ) : (
                    <span>Klik peta untuk pilih lokasi</span>
                )}
            </div>
        </div>
    )
}

export default LocationPicker
