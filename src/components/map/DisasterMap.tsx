'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { MapMarker } from '@/types'

// Fix Leaflet default marker icon issue
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

// Custom colored icons for disaster types
const disasterIcons: Record<string, L.Icon> = {
    BANJIR: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="#1d4ed8" stroke-width="2" fill="#3b82f6"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">B</text>
      </svg>
    `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    GEMPA: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="#b91c1c" stroke-width="2" fill="#ef4444"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">G</text>
      </svg>
    `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    KEBAKARAN: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f97316" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="#c2410c" stroke-width="2" fill="#f97316"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">K</text>
      </svg>
    `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    LONGSOR: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#84cc16" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="#4d7c0f" stroke-width="2" fill="#84cc16"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">L</text>
      </svg>
    `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
    TSUNAMI: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#06b6d4" width="32" height="32">
        <circle cx="12" cy="12" r="10" stroke="#0891b2" stroke-width="2" fill="#06b6d4"/>
        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">T</text>
      </svg>
    `),
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    }),
}

interface DisasterMapProps {
    markers?: MapMarker[]
    center?: [number, number]
    zoom?: number
    onMarkerClick?: (markerId: string) => void
    className?: string
}

export function DisasterMap({
    markers = [],
    center = [-2.5, 118], // Center of Indonesia
    zoom = 5,
    onMarkerClick,
    className = 'h-[500px]',
}: DisasterMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const markersLayerRef = useRef<L.LayerGroup | null>(null)

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        // Initialize map
        const map = L.map(mapRef.current).setView(center, zoom)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        mapInstanceRef.current = map
        markersLayerRef.current = L.layerGroup().addTo(map)

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [center, zoom])

    // Update markers when they change
    useEffect(() => {
        if (!markersLayerRef.current) return

        markersLayerRef.current.clearLayers()

        markers.forEach((marker) => {
            const icon = disasterIcons[marker.type] || defaultIcon

            const markerInstance = L.marker([marker.latitude, marker.longitude], { icon })
                .addTo(markersLayerRef.current!)
                .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${marker.title}</h3>
            <p class="text-xs mt-1">
              <span class="severity-${marker.severity.toLowerCase()} px-1 rounded">${marker.severity}</span>
              <span class="status-${marker.status.toLowerCase().replace('_', '')} px-1 rounded ml-1">${marker.status}</span>
            </p>
          </div>
        `)

            if (onMarkerClick) {
                markerInstance.on('click', () => onMarkerClick(marker.id))
            }
        })
    }, [markers, onMarkerClick])

    return <div ref={mapRef} className={`rounded-lg ${className}`} />
}

export default DisasterMap
