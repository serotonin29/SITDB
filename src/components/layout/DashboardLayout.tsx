'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface DashboardLayoutProps {
    children: React.ReactNode
    breadcrumbs?: { label: string; href?: string }[]
}

export function DashboardLayout({ children, breadcrumbs }: DashboardLayoutProps) {
    // Sidebar State
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false) // Default expanded on desktop

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
                collapsed={isSidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Topbar */}
                <Topbar
                    setSidebarOpen={setSidebarOpen}
                    breadcrumbs={breadcrumbs}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
