import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadResult,
} from "firebase/storage"
import { storage } from "@/lib/firebase"

export interface UploadProgress {
  progress: number
  bytesTransferred: number
  totalBytes: number
}

export class FirebaseStorageService {
  // Upload file with progress tracking
  static uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<{ downloadURL: string; uploadResult: UploadResult }> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
            })
          }
        },
        (error) => {
          console.error("Upload failed:", error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              downloadURL,
              uploadResult: uploadTask.snapshot,
            })
          } catch (error) {
            reject(error)
          }
        },
      )
    })
  }

  // Simple upload without progress tracking
  static async uploadFileSimple(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path)
    const uploadResult = await uploadBytes(storageRef, file)
    return await getDownloadURL(uploadResult.ref)
  }

  // Delete file
  static async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  }

  // Generate file paths
  static generateProfilePicturePath(userId: string, fileName: string): string {
    const extension = fileName.split(".").pop()
    return `profile-pictures/${userId}/${Date.now()}.${extension}`
  }

  static generateDocumentPath(userId: string, fileName: string): string {
    const extension = fileName.split(".").pop()
    return `documents/${userId}/${Date.now()}-${fileName}`
  }

  static generateContestAssetPath(contestId: string, fileName: string): string {
    const extension = fileName.split(".").pop()
    return `contests/${contestId}/${Date.now()}-${fileName}`
  }

  // Validate file types and sizes
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Only JPEG, PNG, GIF, and WebP images are allowed" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 5MB" }
    }

    return { valid: true }
  }

  static validateDocumentFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ["application/pdf", "text/plain", "application/msword", "text/csv"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Only PDF, TXT, DOC, and CSV files are allowed" }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size must be less than 10MB" }
    }

    return { valid: true }
  }
}
