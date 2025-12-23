import winston from 'winston'
import path from 'path'

const logDir = 'logs'

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`
    })
)

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
})

// Audit logging helper
export async function auditLog(
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    changes?: Record<string, unknown>,
    request?: Request
) {
    const logEntry = {
        action,
        entity,
        entityId,
        userId,
        changes,
        ipAddress: request?.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request?.headers.get('user-agent') || 'unknown',
    }

    logger.info(`AUDIT: ${action} on ${entity}`, logEntry)

    // Also persist to database if needed
    try {
        const { prisma } = await import('./prisma')
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                changes: changes as object,
                ipAddress: logEntry.ipAddress,
                userAgent: logEntry.userAgent,
            },
        })
    } catch (error) {
        logger.error('Failed to persist audit log', { error })
    }
}

export default logger
