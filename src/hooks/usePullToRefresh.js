import { useEffect, useRef } from 'react'

export default function usePullToRefresh(onRefresh) {
  const startY = useRef(0)
  const pulling = useRef(false)

  useEffect(() => {
    function handleTouchStart(e) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    }

    function handleTouchEnd(e) {
      if (!pulling.current) return
      const diff = e.changedTouches[0].clientY - startY.current
      pulling.current = false
      if (diff > 80) {
        onRefresh()
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh])
}
