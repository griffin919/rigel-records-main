// composables/useImageCompression.js
export const useImageCompression = () => {
    /**
     * Compress an image file to a target size
     * @param {File} file - The image file to compress
     * @param {number} maxSizeKB - Target maximum size in KB (default: 200)
     * @param {number} maxWidth - Maximum width in pixels (default: 1920)
     * @param {number} maxHeight - Maximum height in pixels (default: 1920)
     * @returns {Promise<{file: File, originalSize: number, compressedSize: number, quality: number}>}
     */
    const compressImage = async (file, maxSizeKB = 200, maxWidth = 1920, maxHeight = 1920) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                const img = new Image()

                img.onload = () => {
                    const canvas = document.createElement('canvas')
                    let width = img.width
                    let height = img.height

                    // Calculate dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width
                            width = maxWidth
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height
                            height = maxHeight
                        }
                    }

                    canvas.width = width
                    canvas.height = height

                    const ctx = canvas.getContext('2d')
                    ctx.drawImage(img, 0, 0, width, height)

                    // Try different quality levels to get close to target size
                    let quality = 0.9
                    const maxSizeBytes = maxSizeKB * 1024

                    const attemptCompression = (q) => {
                        canvas.toBlob(
                            (blob) => {
                                if (blob.size > maxSizeBytes && q > 0.1) {
                                    // Try lower quality
                                    attemptCompression(q - 0.1)
                                } else {
                                    // Create a file from the blob
                                    const compressedFile = new File([blob], file.name, {
                                        type: 'image/jpeg',
                                        lastModified: Date.now()
                                    })
                                    resolve({
                                        file: compressedFile,
                                        originalSize: file.size,
                                        compressedSize: blob.size,
                                        quality: q
                                    })
                                }
                            },
                            'image/jpeg',
                            q
                        )
                    }

                    attemptCompression(quality)
                }

                img.onerror = () => reject(new Error('Failed to load image'))
                img.src = e.target.result
            }

            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsDataURL(file)
        })
    }

    /**
     * Format file size to human-readable string
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size (e.g., "1.5 MB", "250 KB")
     */
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'

        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    /**
     * Calculate compression ratio
     * @param {number} originalSize - Original file size in bytes
     * @param {number} compressedSize - Compressed file size in bytes
     * @returns {string} Reduction percentage (e.g., "75.5%")
     */
    const calculateReduction = (originalSize, compressedSize) => {
        const reduction = ((originalSize - compressedSize) / originalSize) * 100
        return reduction.toFixed(1) + '%'
    }

    return {
        compressImage,
        formatFileSize,
        calculateReduction
    }
}
