import { useState, useEffect } from 'react'
import { fetchHomeData, HomeData } from '../utils/sanityClient'

interface UseHomeDataReturn {
  homeData: HomeData | null
  loading: boolean
  error: string | null
}

export const useHomeData = (): UseHomeDataReturn => {
  const [homeData, setHomeData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchHomeData()
        setHomeData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch home data')
        console.error('Error fetching home data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  return { homeData, loading, error }
}
