import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { newJobSchema, NewJobFormData } from '@/lib/validators'
import { Database } from '@/lib/supabaseClient'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']

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

export const NewJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const { data: project, error: projectError, isLoading: projectLoading } = useSWR(
    user && id ? `project-${id}` : null,
    user && id ? createProjectFetcher(user.id, id) : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<NewJobFormData>({
    resolver: zodResolver(newJobSchema),
  })

  // Prefill cornerstone sheet URL when project loads
  React.useEffect(() => {
    if (project?.cornerstone_sheet) {
      setValue('cornerstoneSheetUrl', project.cornerstone_sheet)
    }
  }, [project, setValue])

  const onSubmit = async (data: NewJobFormData) => {
    if (!id || !user) return

    setIsSubmitting(true)
    try {
      // Insert job with status='queued'
      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
          project_id: id,
          title: data.title,
          article_doc: data.articleDocUrl,
          cornerstone_sheet: data.cornerstoneSheetUrl || null,
          status: 'queued',
          anchors_added: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger job processing (optional - call edge function)
      try {
        await supabase.functions.invoke('trigger-job', {
          body: { job_id: job.id },
        })
      } catch (functionError) {
        // Job was created but function failed - that's okay for now
        console.warn('Function trigger failed:', functionError)
      }

      toast({
        title: 'Success',
        description: 'Article added to processing queue!',
      })

      // Redirect to project jobs page
      navigate(`/projects/${id}/jobs`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add article',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (projectLoading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
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

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link to={`/project/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Add New Article</h1>
          <p className="text-muted-foreground">
            Add a Google Docs article to <strong>{project.title}</strong> for internal linking processing.
          </p>
        </div>

        {/* Job Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Article Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  placeholder="How to Optimize Your Website for SEO"
                  {...register('title')}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="articleDocUrl">Google Docs URL *</Label>
                <Input
                  id="articleDocUrl"
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  {...register('articleDocUrl')}
                  disabled={isSubmitting}
                />
                {errors.articleDocUrl && (
                  <p className="text-sm text-destructive">{errors.articleDocUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Make sure the document is publicly accessible or shared with the processing service.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cornerstoneSheetUrl">Cornerstone Sheet URL</Label>
                <Input
                  id="cornerstoneSheetUrl"
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  {...register('cornerstoneSheetUrl')}
                  disabled={isSubmitting}
                />
                {errors.cornerstoneSheetUrl && (
                  <p className="text-sm text-destructive">{errors.cornerstoneSheetUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {project.cornerstone_sheet 
                    ? 'Pre-filled from project settings. You can override this for this specific article.'
                    : 'Optional: Specify a cornerstone content sheet for this article.'
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/project/${id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Article...
                    </>
                  ) : (
                    'Add Article'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h4 className="font-medium">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your article will be queued for processing</li>
                <li>• The system will analyze the content for internal linking opportunities</li>
                <li>• You'll see real-time status updates on the project page</li>
                <li>• Once complete, you can review the suggested anchor text changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}