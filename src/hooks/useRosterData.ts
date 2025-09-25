import { useState, useEffect } from 'react'
import { fetchRosterData, RosterArtist } from '../utils/sanityClient'

export const useRosterData = () => {
  const [rosterData, setRosterData] = useState<RosterArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRosterData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchRosterData()
        setRosterData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster data')
        console.error('Error fetching roster data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRosterData()
  }, [])

  return { rosterData, loading, error }
}
