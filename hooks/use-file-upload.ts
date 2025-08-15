"use client"

import { useState } from "react"
import { FirebaseStorageService, type UploadProgress } from "@/lib/firebase/storage"

interface UseFileUploadOptions {
  onSuccess?: (downloadURL: string) => void
  onError?: (error: string) => void
  validateFile?: (file: File) => { valid: boolean; error?: string }
  generatePath?: (file: File) => string
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadURL, setDownloadURL] = useState<string | null>(null)

  const uploadFile = async (file: File, customPath?: string) => {
    setUploading(true)
    setError(null)
    setProgress(null)
    setDownloadURL(null)

    try {
      // Validate file if validator provided
      if (options.validateFile) {
        const validation = options.validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error || "Invalid file")
        }
      }

      // Generate path
      const path = customPath || options.generatePath?.(file) || `uploads/${Date.now()}-${file.name}`

      // Upload file
      const result = await FirebaseStorageService.uploadFile(file, path, (progressData) => {
        setProgress(progressData)
      })

      setDownloadURL(result.downloadURL)
      options.onSuccess?.(result.downloadURL)

      return result.downloadURL
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed"
      setError(errorMessage)
      options.onError?.(errorMessage)
      throw err
    } finally {
      setUploading(false)
      setProgress(null)
    }
  }

  const reset = () => {
    setUploading(false)
    setProgress(null)
    setError(null)
    setDownloadURL(null)
  }

  return {
    uploadFile,
    uploading,
    progress,
    error,
    downloadURL,
    reset,
  }
}

// Specialized hooks for common use cases
export function useProfilePictureUpload(userId: string) {
  return useFileUpload({
    validateFile: FirebaseStorageService.validateImageFile,
    generatePath: (file) => FirebaseStorageService.generateProfilePicturePath(userId, file.name),
  })
}

export function useDocumentUpload(userId: string) {
  return useFileUpload({
    validateFile: FirebaseStorageService.validateDocumentFile,
    generatePath: (file) => FirebaseStorageService.generateDocumentPath(userId, file.name),
  })
}
