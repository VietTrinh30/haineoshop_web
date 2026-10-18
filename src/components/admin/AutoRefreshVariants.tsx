'use client'
import { useEffect, useRef } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export function AutoRefreshVariants() {
  const { data } = useDocumentInfo()
  const updatedAt = data?.updatedAt as string | undefined
  const id = data?.id as string | number | undefined
  const router = useRouter()
  
  // Combine id and updatedAt to detect both new document creation and updates
  const cacheKey = id ? `${id}-${updatedAt || ''}` : undefined
  const prevKey = useRef(cacheKey)

  useEffect(() => {
    // Only reload if we transition from an old state to a new valid cacheKey
    if (cacheKey && cacheKey !== prevKey.current) {
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
    prevKey.current = cacheKey
  }, [cacheKey, router])

  return null
}
