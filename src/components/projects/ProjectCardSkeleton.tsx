import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const ProjectCardSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)