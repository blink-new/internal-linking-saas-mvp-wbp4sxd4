import React from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { JobsTable } from '@/components/jobs/JobsTable'
import { AddArticleDialog } from '@/components/jobs/AddArticleDialog'
import { JobDrawer } from '@/components/jobs/JobDrawer'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'
import { 
  Plus, 
  Globe, 
  Calendar, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

type Project = Database['public']['Tables']['projects']['Row']
type Job = Database['public']['Tables']['jobs']['Row']

const createProjectFetcher = (userId: string, projectId: string) => async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

const createJobsFetcher = (projectId: string) => async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [showAddArticle, setShowAddArticle] = React.useState(false)
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null)

  const { data: project, error: projectError, isLoading: projectLoading } = useSWR(
    user && id ? `project-${id}` : null,
    user && id ? createProjectFetcher(user.id, id) : null
  )

  const { data: jobs, error: jobsError, mutate: mutateJobs, isLoading: jobsLoading } = useSWR(
    id ? `jobs-${id}` : null,
    id ? createJobsFetcher(id) : null,
    {
      refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
    }
  )

  // Set up real-time subscription for jobs
  React.useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`project-${id}-jobs`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `project_id=eq.${id}`,
        },
        () => {
          mutateJobs()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, mutateJobs])

  const handleArticleAdded = () => {
    mutateJobs()
  }

  const handleJobClick = (job: Job) => {
    setSelectedJobId(job.id)
  }

  if (projectLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold">Project not found</h3>
            <p className="text-sm mt-1">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to="/" className="inline-block mt-4">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const jobStats = jobs ? {
    total: jobs.length,
    queued: jobs.filter(j => j.status === 'queued').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'done').length,
    failed: jobs.filter(j => j.status === 'error').length,
    totalAnchors: jobs.reduce((sum, j) => sum + (j.anchors_n || 0), 0),
  } : {
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalAnchors: 0,
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <a 
                  href={project.site_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center space-x-1"
                >
                  <span>{project.site_url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(project.created_at)}</span>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowAddArticle(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {jobStats.queued + jobStats.processing}
              </div>
              <p className="text-xs text-muted-foreground">
                {jobStats.queued} queued, {jobStats.processing} processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{jobStats.completed}</div>
              {jobStats.failed > 0 && (
                <p className="text-xs text-destructive">
                  {jobStats.failed} failed
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Anchors</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobStats.totalAnchors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Articles</h2>
            {jobs && jobs.length > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{jobs.length} total</Badge>
              </div>
            )}
          </div>
          
          <JobsTable
            jobs={jobs || []}
            loading={jobsLoading}
            onJobClick={handleJobClick}
            onJobUpdate={mutateJobs}
          />
        </div>
      </motion.div>

      <AddArticleDialog
        open={showAddArticle}
        onOpenChange={setShowAddArticle}
        projectId={id!}
        onSuccess={handleArticleAdded}
      />

      <JobDrawer
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
        jobId={selectedJobId}
      />
    </div>
  )
}