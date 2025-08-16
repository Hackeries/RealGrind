"use client"

import { useState, useRef, useEffect } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  quality?: number
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder = "/placeholder.svg",
  quality = 75,
  priority = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const isInView = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: "50px",
  })

  const shouldLoad = priority || isInView

  useEffect(() => {
    if (shouldLoad && !isLoaded && !hasError) {
      const img = new Image()
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setHasError(true)
      img.src = src
    }
  }, [shouldLoad, src, isLoaded, hasError])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder || "/placeholder.svg"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          width={width}
          height={height}
        />
      )}

      {/* Main image */}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={hasError ? placeholder : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Loading indicator */}
      {shouldLoad && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
