import React from 'react'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime, formatNumber } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'
import { FileText, Clock, CheckCircle, XCircle, Loader2, Edit, ExternalLink } from 'lucide-react'
import { AnchorDataDisplay } from './AnchorDataDisplay'
import { EditJobModal } from './EditJobModal'

type Job = Database['public']['Tables']['jobs']['Row']

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
  onJobClick: (job: Job) => void
  onJobUpdate?: () => void
}

const getStatusConfig = (status: Job['status']) => {
  switch (status) {
    case 'queued':
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-muted-foreground',
      }
    case 'processing':
      return {
        variant: 'default' as const,
        icon: Loader2,
        color: 'text-amber-600 dark:text-amber-400',
      }
    case 'done':
      return {
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600 dark:text-green-400',
      }
    case 'error':
      return {
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-destructive',
      }
    default:
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-muted-foreground',
      }
  }
}

const JobRow: React.FC<{ job: Job; onClick: () => void; onJobUpdate?: () => void }> = ({ job, onClick, onJobUpdate }) => {
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const statusConfig = getStatusConfig(job.status)
  const StatusIcon = statusConfig.icon

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditModalOpen(true)
  }

  const handleJobUpdate = () => {
    onJobUpdate?.()
  }

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        className="cursor-pointer"
        onClick={onClick}
      >
        <TableCell className="font-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-2">{job.title}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-8 w-8 p-0 hover:bg-muted ml-2 shrink-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={statusConfig.variant} className="capitalize">
            <StatusIcon 
              className={`mr-1 h-3 w-3 ${
                job.status === 'processing' ? 'animate-spin' : ''
              } ${statusConfig.color}`} 
            />
            {job.status}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          {job.anchors_n > 0 ? (
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatNumber(job.anchors_n)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="hidden sm:table-cell max-w-[220px]">
          {job.anchors && Array.isArray(job.anchors) && job.anchors.length > 0 ? (
            <div className="truncate" title={job.anchors.map((a: any) => a.slug).join(', ')}>
              {job.anchors.map((a: any) => a.slug).join(', ').length > 50 
                ? job.anchors.map((a: any) => a.slug).join(', ').substring(0, 50) + '...'
                : job.anchors.map((a: any) => a.slug).join(', ')
              }
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          {job.article_url ? (
            <Badge variant="outline" className="cursor-pointer" asChild>
              <a 
                href={job.article_url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View</span>
              </a>
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">(pending)</span>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatRelativeTime(job.updated_at)}
        </TableCell>
      </motion.tr>
      
      {/* Anchor data row - only show for completed jobs */}
      {job.status === 'done' && (job.anchors_n > 0 || job.article_url) && (
        <motion.tr
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t-0"
        >
          <TableCell colSpan={6} className="py-2 bg-muted/20">
            <AnchorDataDisplay job={job} />
          </TableCell>
        </motion.tr>
      )}

      <EditJobModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        job={job}
        onSuccess={handleJobUpdate}
      />
    </>
  )
}

const SkeletonRow: React.FC = () => (
  <TableRow>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-48" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-8" />
    </TableCell>
    <TableCell className="hidden sm:table-cell">
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
  </TableRow>
)

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, loading, onJobClick, onJobUpdate }) => {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Anchors Added</TableHead>
              <TableHead className="hidden sm:table-cell">Anchor Slugs</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No articles yet</h3>
        <p className="mt-2 text-muted-foreground">
          Add your first Google Docs article to get started with internal linking.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Anchors Added</TableHead>
            <TableHead className="hidden sm:table-cell">Anchor Slugs</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onClick={() => onJobClick(job)}
              onJobUpdate={onJobUpdate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}