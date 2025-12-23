'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Dynamic breadcrumbs based on path
    const breadcrumbs = [
        { label: 'Admin', href: '/admin' },
        ...(pathname === '/admin/users' ? [{ label: 'Manajemen Akun' }] : []),
        ...(pathname === '/admin/reports' ? [{ label: 'Manajemen Laporan' }] : []),
    ]

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            {children}
        </DashboardLayout>
    )
}
