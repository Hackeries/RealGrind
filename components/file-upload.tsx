"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, File, ImageIcon, CheckCircle, AlertCircle } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"

interface FileUploadProps {
  onUploadComplete?: (downloadURL: string) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSize?: number
  validateFile?: (file: File) => { valid: boolean; error?: string }
  generatePath?: (file: File) => string
  className?: string
  children?: React.ReactNode
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  validateFile,
  generatePath,
  className = "",
  children,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { uploadFile, uploading, progress, error, downloadURL, reset } = useFileUpload({
    onSuccess: onUploadComplete,
    onError: onUploadError,
    validateFile,
    generatePath,
  })

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    reset()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadFile(selectedFile)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isImage = (file: File) => file.type.startsWith("image/")

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : selectedFile
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          {children || (
            <>
              <div className="mb-4">
                {selectedFile ? (
                  isImage(selectedFile) ? (
                    <ImageIcon className="w-12 h-12 text-green-600 mx-auto" />
                  ) : (
                    <File className="w-12 h-12 text-blue-600 mx-auto" />
                  )
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  <Button onClick={clearFile} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Maximum file size: {formatFileSize(maxSize)}</p>
                </div>
              )}
            </>
          )}

          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden" />

          {!selectedFile && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mt-4"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {progress && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(progress.bytesTransferred)} of {formatFileSize(progress.totalBytes)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {selectedFile && !downloadURL && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          )}
        </Button>
      )}

      {/* Success Message */}
      {downloadURL && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">File uploaded successfully!</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
