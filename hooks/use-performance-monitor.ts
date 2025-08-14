"use client"

import { useEffect, useCallback } from "react"

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTimes: Record<string, number>
  renderTime: number
  memoryUsage?: number
}

export function usePerformanceMonitor() {
  const trackPageLoad = useCallback(() => {
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      console.log(`Page load time: ${loadTime}ms`)

      // Send to analytics if needed
      if (loadTime > 3000) {
        console.warn("Slow page load detected:", loadTime)
      }
    }
  }, [])

  const trackAPICall = useCallback((endpoint: string, startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`API call to ${endpoint}: ${duration.toFixed(2)}ms`)

    if (duration > 2000) {
      console.warn("Slow API call detected:", endpoint, duration)
    }

    return duration
  }, [])

  const trackRender = useCallback((componentName: string, renderTime: number) => {
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`)
    }
  }, [])

  useEffect(() => {
    // Track initial page load
    if (document.readyState === "complete") {
      trackPageLoad()
    } else {
      window.addEventListener("load", trackPageLoad)
      return () => window.removeEventListener("load", trackPageLoad)
    }
  }, [trackPageLoad])

  return {
    trackAPICall,
    trackRender,
    trackPageLoad,
  }
}
