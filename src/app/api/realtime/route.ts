import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/realtime - Server-Sent Events for realtime updates
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const encoder = new TextEncoder()
    let intervalId: NodeJS.Timeout | null = null

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection message
            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date() })}\n\n`)
            )

            // Keep track of last check time
            let lastCheckTime = new Date()

            // Poll for new updates every 5 seconds
            intervalId = setInterval(async () => {
                try {
                    // Get new reports since last check
                    const newReports = await prisma.disasterReport.findMany({
                        where: {
                            createdAt: { gt: lastCheckTime },
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    })

                    // Get status updates since last check
                    const statusUpdates = await prisma.reportStatus.findMany({
                        where: {
                            createdAt: { gt: lastCheckTime },
                        },
                        include: {
                            report: {
                                select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                },
                            },
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    })

                    lastCheckTime = new Date()

                    // Send new reports
                    for (const report of newReports) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({
                                type: 'NEW_REPORT',
                                data: { reportId: report.id, report },
                                timestamp: new Date(),
                            })}\n\n`)
                        )
                    }

                    // Send status updates
                    for (const update of statusUpdates) {
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({
                                type: 'STATUS_UPDATE',
                                data: {
                                    reportId: update.reportId,
                                    status: update.status,
                                    updatedBy: update.user.name,
                                    report: update.report,
                                },
                                timestamp: new Date(),
                            })}\n\n`)
                        )
                    }

                    // Send heartbeat
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'HEARTBEAT', timestamp: new Date() })}\n\n`)
                    )
                } catch (error) {
                    logger.error('SSE error', { error })
                }
            }, 5000)
        },
        cancel() {
            if (intervalId) {
                clearInterval(intervalId)
            }
        },
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
