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
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime, formatNumber } from '@/lib/formatters'
import { Database } from '@/lib/supabaseClient'
import { FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

type Job = Database['public']['Tables']['jobs']['Row']

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
  onJobClick: (job: Job) => void
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

const JobRow: React.FC<{ job: Job; onClick: () => void }> = ({ job, onClick }) => {
  const statusConfig = getStatusConfig(job.status)
  const StatusIcon = statusConfig.icon

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="line-clamp-2">{job.title}</span>
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
        {job.anchors_added > 0 ? (
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatNumber(job.anchors_added)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatRelativeTime(job.updated_at)}
      </TableCell>
    </motion.tr>
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
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
  </TableRow>
)

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, loading, onJobClick }) => {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Anchors Added</TableHead>
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
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onClick={() => onJobClick(job)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}