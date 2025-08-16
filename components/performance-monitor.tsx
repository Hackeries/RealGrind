"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Clock, Database } from "lucide-react"

interface PerformanceMetrics {
  pageLoadTime: number
  renderTime: number
  apiCalls: Array<{ endpoint: string; duration: number; timestamp: number }>
  memoryUsage: number
  connectionType: string
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const collectMetrics = () => {
      if (typeof window === "undefined") return

      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      const memory = (performance as any).memory

      const newMetrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        renderTime: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        apiCalls: [],
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
        connectionType: (navigator as any).connection?.effectiveType || "unknown",
      }

      setMetrics(newMetrics)
    }

    // Collect metrics after page load
    if (document.readyState === "complete") {
      collectMetrics()
    } else {
      window.addEventListener("load", collectMetrics)
    }

    // Keyboard shortcut to toggle visibility
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("load", collectMetrics)
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [])

  if (!metrics || !isVisible || process.env.NODE_ENV !== "development") {
    return null
  }

  const getPerformanceStatus = (time: number, thresholds: { good: number; fair: number }) => {
    if (time <= thresholds.good) return { status: "good", color: "bg-green-500" }
    if (time <= thresholds.fair) return { status: "fair", color: "bg-yellow-500" }
    return { status: "poor", color: "bg-red-500" }
  }

  const loadTimeStatus = getPerformanceStatus(metrics.pageLoadTime, { good: 1000, fair: 3000 })
  const renderTimeStatus = getPerformanceStatus(metrics.renderTime, { good: 50, fair: 100 })

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-2 border-blue-200 bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Performance Monitor</span>
            <Badge variant="outline" className="text-xs">
              DEV
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">Press Ctrl+Shift+P to toggle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs">Page Load</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${loadTimeStatus.color}`} />
              <span className="text-xs font-mono">{metrics.pageLoadTime.toFixed(0)}ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-3 h-3 text-gray-500" />
              <span className="text-xs">Render</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${renderTimeStatus.color}`} />
              <span className="text-xs font-mono">{metrics.renderTime.toFixed(0)}ms</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-3 h-3 text-gray-500" />
              <span className="text-xs">Memory</span>
            </div>
            <span className="text-xs font-mono">{metrics.memoryUsage.toFixed(1)}MB</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs">Connection</span>
            <Badge variant="outline" className="text-xs">
              {metrics.connectionType}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
