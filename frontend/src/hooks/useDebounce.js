import { useState, useEffect } from 'react'

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Debounced callback hook
export const useDebouncedCallback = (callback, delay = 500) => {
  const [timeoutId, setTimeoutId] = useState(null)

  const debouncedCallback = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    const newTimeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
    
    setTimeoutId(newTimeoutId)
  }, [callback, delay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback
}