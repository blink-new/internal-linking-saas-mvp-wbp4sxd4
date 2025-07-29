import React from 'react'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime, formatDuration, formatNumber } from '@/lib/formatters'
import { useRealtimeJob } from '@/hooks/useRealtimeJob'
import { Database } from '@/lib/supabaseClient'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Calendar,
  Target
} from 'lucide-react'
import ReactDiffViewer from 'react-diff-viewer-continued'

type Job = Database['public']['Tables']['jobs']['Row']

interface JobDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string | null
}

const getStatusConfig = (status: Job['status']) => {
  switch (status) {
    case 'queued':
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-muted-foreground',
        label: 'Queued',
      }
    case 'processing':
      return {
        variant: 'default' as const,
        icon: Loader2,
        color: 'text-amber-600 dark:text-amber-400',
        label: 'Processing',
      }
    case 'done':
      return {
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
        label: 'Completed',
      }
    case 'error':
      return {
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-destructive',
        label: 'Error',
      }
    default:
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-muted-foreground',
        label: 'Unknown',
      }
  }
}

export const JobDrawer: React.FC<JobDrawerProps> = ({ open, onOpenChange, jobId }) => {
  const { job, loading, error } = useRealtimeJob(jobId || '')

  if (!jobId) return null

  const statusConfig = job ? getStatusConfig(job.status) : null
  const StatusIcon = statusConfig?.icon || Clock

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="h-full flex flex-col"
        >
          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="mt-4 text-lg font-semibold">Error loading job</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
            </div>
          ) : job ? (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <SheetTitle className="text-xl line-clamp-2">{job.title}</SheetTitle>
                    <SheetDescription className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Job Details</span>
                    </SheetDescription>
                  </div>
                  <Badge variant={statusConfig.variant} className="ml-4">
                    <StatusIcon 
                      className={`mr-1 h-3 w-3 ${
                        job.status === 'processing' ? 'animate-spin' : ''
                      } ${statusConfig.color}`} 
                    />
                    {statusConfig.label}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                  {/* Left Column - Job Meta */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Job Information
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={statusConfig.variant} size="sm">
                            <StatusIcon 
                              className={`mr-1 h-3 w-3 ${
                                job.status === 'processing' ? 'animate-spin' : ''
                              } ${statusConfig.color}`} 
                            />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Anchors Added</span>
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {job.anchors_added > 0 ? formatNumber(job.anchors_added) : '-'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatRelativeTime(job.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Processing Time</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDuration(job.created_at, job.status === 'done' ? job.updated_at : undefined)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Source Document
                      </h3>
                      <a
                        href={job.article_doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open Google Doc</span>
                      </a>
                    </div>

                    {job.error_message && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3 className="font-semibold text-sm uppercase tracking-wide text-destructive">
                            Error Details
                          </h3>
                          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                            {job.error_message}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column - Diff Viewer */}
                  <div className="lg:col-span-2">
                    <div className="h-full flex flex-col">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                        Content Changes
                      </h3>
                      
                      {job.before_html && job.after_html ? (
                        <div className="flex-1 border rounded-lg overflow-hidden">
                          <ReactDiffViewer
                            oldValue={job.before_html}
                            newValue={job.after_html}
                            splitView={true}
                            showDiffOnly={false}
                            leftTitle="Before"
                            rightTitle="After"
                            styles={{
                              variables: {
                                dark: {
                                  diffViewerBackground: 'hsl(var(--background))',
                                  diffViewerColor: 'hsl(var(--foreground))',
                                  addedBackground: 'hsl(var(--success) / 0.1)',
                                  addedColor: 'hsl(var(--success))',
                                  removedBackground: 'hsl(var(--destructive) / 0.1)',
                                  removedColor: 'hsl(var(--destructive))',
                                },
                                light: {
                                  diffViewerBackground: 'hsl(var(--background))',
                                  diffViewerColor: 'hsl(var(--foreground))',
                                  addedBackground: 'hsl(var(--success) / 0.1)',
                                  addedColor: 'hsl(var(--success))',
                                  removedBackground: 'hsl(var(--destructive) / 0.1)',
                                  removedColor: 'hsl(var(--destructive))',
                                },
                              },
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/20">
                          <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h4 className="mt-4 font-semibold">No diff available</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {job.status === 'queued' || job.status === 'processing'
                                ? 'Processing will generate content diff'
                                : 'No content changes were made'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}