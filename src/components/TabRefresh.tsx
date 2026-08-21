'use client'

import { useEffect, useRef } from 'react'

export default function TabRefresh() {
  const wasHidden = useRef(false)

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden.current = true
      } else if (wasHidden.current) {
        wasHidden.current = false
        window.location.reload()
      }
    }

    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return null
}
