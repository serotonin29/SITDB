// Firebase Storage utilities for media uploads
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

// Upload file to Firebase Storage
export async function uploadReportMedia(
    reportId: string,
    file: File,
    type: 'image' | 'video' = 'image'
): Promise<{ url: string; filename: string } | null> {
    if (!storage) return null

    try {
        const timestamp = Date.now()
        const filename = `${timestamp}_${file.name}`
        const filePath = `reports/${reportId}/${filename}`
        const storageRef = ref(storage, filePath)

        // Upload file
        await uploadBytes(storageRef, file, {
            contentType: file.type,
            customMetadata: {
                reportId,
                type,
                originalName: file.name,
            },
        })

        // Get download URL
        const url = await getDownloadURL(storageRef)

        return { url, filename }
    } catch (error) {
        console.error('Error uploading file:', error)
        return null
    }
}

// Delete file from Firebase Storage
export async function deleteReportMedia(reportId: string, filename: string): Promise<boolean> {
    if (!storage) return false

    try {
        const filePath = `reports/${reportId}/${filename}`
        const storageRef = ref(storage, filePath)
        await deleteObject(storageRef)
        return true
    } catch (error) {
        console.error('Error deleting file:', error)
        return false
    }
}

// Upload multiple files
export async function uploadMultipleFiles(
    reportId: string,
    files: File[]
): Promise<{ url: string; filename: string; type: 'IMAGE' | 'VIDEO' }[]> {
    const results: { url: string; filename: string; type: 'IMAGE' | 'VIDEO' }[] = []

    for (const file of files) {
        const isVideo = file.type.startsWith('video/')
        const type = isVideo ? 'video' : 'image'

        const result = await uploadReportMedia(reportId, file, type)
        if (result) {
            results.push({
                ...result,
                type: isVideo ? 'VIDEO' : 'IMAGE',
            })
        }
    }

    return results
}

// Get file size in human readable format
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
    ]

    if (file.size > maxSize) {
        return { valid: false, error: `Ukuran file maksimal 10MB. File Anda: ${formatFileSize(file.size)}` }
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, MP4, atau WebM.' }
    }

    return { valid: true }
}
