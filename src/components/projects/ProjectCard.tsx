import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelativeTime } from '@/lib/formatters'
import { ExternalLink, Calendar, Globe } from 'lucide-react'
import { Database } from '@/lib/supabaseClient'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCardProps {
  project: Project
  jobCount?: number
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, jobCount = 0 }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/project/${project.id}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
              <Badge variant="secondary" className="ml-2 shrink-0">
                {jobCount} jobs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="mr-2 h-4 w-4" />
              <span className="truncate">{project.site_url}</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Created {formatRelativeTime(project.created_at)}</span>
            </div>

            {project.cornerstone_sheet && (
              <div className="pt-2">
                <Badge variant="outline" className="text-xs">
                  Has cornerstone sheet
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}