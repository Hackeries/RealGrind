"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useProfilePictureUpload } from "@/hooks/use-file-upload"
import { UserOperations } from "@/lib/firestore/operations"

interface ProfilePictureUploadProps {
  userId: string
  currentImageUrl?: string
  userName?: string
  onUploadComplete?: (imageUrl: string) => void
  size?: "sm" | "md" | "lg"
}

export function ProfilePictureUpload({
  userId,
  currentImageUrl,
  userName = "User",
  onUploadComplete,
  size = "md",
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  const { uploadFile, uploading, progress, error, downloadURL, reset } = useProfilePictureUpload(userId)

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const imageUrl = await uploadFile(file)

      // Update user profile with new image URL
      setUpdating(true)
      await UserOperations.updateUser(userId, {
        profilePicture: imageUrl,
        updatedAt: new Date(),
      })

      onUploadComplete?.(imageUrl)
      setPreviewUrl(null)
    } catch (err) {
      setPreviewUrl(null)
      // Error is handled by the hook
    } finally {
      setUpdating(false)
    }
  }

  const displayImageUrl = previewUrl || downloadURL || currentImageUrl

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={displayImageUrl || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="text-lg">{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <label
            htmlFor={`profile-upload-${userId}`}
            className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </label>

          <input
            id={`profile-upload-${userId}`}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || updating}
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">Click camera to change photo</p>
        </div>
      </div>

      {/* Upload Progress */}
      {progress && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading photo...</span>
              <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {downloadURL && !updating && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Profile picture updated successfully!</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Updating Database */}
      {updating && (
        <Alert>
          <Upload className="h-4 w-4 animate-pulse" />
          <AlertDescription>Updating profile...</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
