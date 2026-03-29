import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useNotification } from '../context/NotificationContext'
import api from '../services/api'

export const useAxios = (config, options = {}) => {
  const { immediate = true, onSuccess, onError, showToast = true } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { token } = useAuth()
  const { showError, showSuccess } = useNotification()

  const execute = useCallback(async (overrideConfig = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const finalConfig = {
        ...config,
        ...overrideConfig,
        headers: {
          ...config?.headers,
          ...overrideConfig?.headers,
          Authorization: token ? `Bearer ${token}` : undefined
        }
      }
      
      const response = await api(finalConfig)
      setData(response.data)
      
      if (onSuccess) onSuccess(response.data)
      if (showToast && response.message) {
        showSuccess(response.message)
      }
      
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Something went wrong'
      setError(errorMessage)
      
      if (onError) onError(err)
      if (showToast) {
        showError(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [config, token, onSuccess, onError, showToast, showError, showSuccess])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute, setData }
}

// GET hook
export const useGet = (url, options = {}) => {
  return useAxios({ method: 'GET', url }, options)
}

// POST hook
export const usePost = (url, options = {}) => {
  return useAxios({ method: 'POST', url }, { immediate: false, ...options })
}

// PUT hook
export const usePut = (url, options = {}) => {
  return useAxios({ method: 'PUT', url }, { immediate: false, ...options })
}

// PATCH hook
export const usePatch = (url, options = {}) => {
  return useAxios({ method: 'PATCH', url }, { immediate: false, ...options })
}

// DELETE hook
export const useDelete = (url, options = {}) => {
  return useAxios({ method: 'DELETE', url }, { immediate: false, ...options })
}