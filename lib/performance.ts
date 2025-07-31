/**
 * Performance Monitoring Utilities
 * 
 * This module provides utilities for monitoring application performance
 * and optimizing user experience.
 */

import React from 'react'

// Performance metrics tracking
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url?: string
  userAgent?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 100 // Keep only last 100 metrics

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...metadata
    }

    this.metrics.push(metric)

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value}ms`)
    }

    // In production, you might want to send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name)
  }

  /**
   * Get average value for a metric
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Send metric to analytics service (placeholder)
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Placeholder for analytics integration
    // Example: Google Analytics, Mixpanel, etc.
    
    // You could implement something like:
    // gtag('event', 'performance_metric', {
    //   metric_name: metric.name,
    //   metric_value: metric.value,
    //   custom_parameter: metric.url
    // })
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Measure execution time of a function
 */
export function measureExecutionTime<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      performanceMonitor.recordMetric(name, end - start)
    })
  } else {
    const end = performance.now()
    performanceMonitor.recordMetric(name, end - start)
    return result
  }
}

/**
 * Measure React component render time
 */
export function measureRenderTime(componentName: string) {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function MeasuredComponent(props: P) {
      const start = performance.now()
      
      React.useEffect(() => {
        const end = performance.now()
        performanceMonitor.recordMetric(`render_${componentName}`, end - start)
      })
      
      return React.createElement(Component, props)
    }
  }
}

/**
 * Measure Web3 transaction time
 */
export async function measureTransactionTime<T>(
  transactionName: string,
  transactionFn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await transactionFn()
    const end = performance.now()
    performanceMonitor.recordMetric(`transaction_${transactionName}`, end - start)
    return result
  } catch (error) {
    const end = performance.now()
    performanceMonitor.recordMetric(`transaction_${transactionName}_error`, end - start)
    throw error
  }
}

/**
 * Measure API call time
 */
export async function measureApiCall<T>(
  apiName: string,
  apiFn: () => Promise<T>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await apiFn()
    const end = performance.now()
    performanceMonitor.recordMetric(`api_${apiName}`, end - start)
    return result
  } catch (error) {
    const end = performance.now()
    performanceMonitor.recordMetric(`api_${apiName}_error`, end - start)
    throw error
  }
}

/**
 * Monitor Core Web Vitals
 */
export function monitorWebVitals(): void {
  if (typeof window === 'undefined') return

  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        if (lastEntry) {
          performanceMonitor.recordMetric('lcp', lastEntry.startTime)
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          performanceMonitor.recordMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        performanceMonitor.recordMetric('cls', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error)
    }
  }

  // Time to First Byte (TTFB)
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0]
        performanceMonitor.recordMetric('ttfb', entry.responseStart - entry.requestStart)
        performanceMonitor.recordMetric('dom_load', entry.domContentLoadedEventEnd - entry.fetchStart)
        performanceMonitor.recordMetric('page_load', entry.loadEventEnd - entry.fetchStart)
      }
    })
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): Record<string, number> {
  const metrics = performanceMonitor.getMetrics()
  const summary: Record<string, number> = {}
  
  // Group metrics by name and calculate averages
  const metricGroups = metrics.reduce((groups, metric) => {
    if (!groups[metric.name]) {
      groups[metric.name] = []
    }
    groups[metric.name].push(metric.value)
    return groups
  }, {} as Record<string, number[]>)
  
  // Calculate averages
  Object.entries(metricGroups).forEach(([name, values]) => {
    summary[name] = values.reduce((sum, value) => sum + value, 0) / values.length
  })
  
  return summary
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  React.useEffect(() => {
    const start = performance.now()
    
    return () => {
      const end = performance.now()
      performanceMonitor.recordMetric(`component_${componentName}`, end - start)
    }
  }, [componentName])
  
  return {
    recordMetric: (name: string, value: number) => {
      performanceMonitor.recordMetric(`${componentName}_${name}`, value)
    },
    measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      return measureApiCall(`${componentName}_${name}`, fn)
    }
  }
}

// Initialize web vitals monitoring on client side
if (typeof window !== 'undefined') {
  monitorWebVitals()
}