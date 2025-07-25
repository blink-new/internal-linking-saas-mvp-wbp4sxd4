import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/lib/supabaseClient'

type Job = Database['public']['Tables']['jobs']['Row']

export const useRealtimeJob = (jobId: string) => {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) return

    // Fetch initial job data
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error) throw error
        setJob(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch job')
      } finally {
        setLoading(false)
      }
    }

    fetchJob()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          setJob(payload.new as Job)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId])

  return { job, loading, error }
}