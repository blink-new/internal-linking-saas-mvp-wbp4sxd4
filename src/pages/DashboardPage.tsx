import React from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { Plus, FolderOpen } from 'lucide-react'
import { Database } from '@/lib/supabaseClient'

type Project = Database['public']['Tables']['projects']['Row']

const createFetcher = (userId: string) => async () => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      jobs(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

const ProjectSkeleton: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [showProjectModal, setShowProjectModal] = React.useState(false)
  
  const { data: projects, error, mutate, isLoading } = useSWR(
    user ? 'projects' : null,
    user ? createFetcher(user.id) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const handleProjectCreated = () => {
    mutate()
  }

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your internal linking projects
            </p>
          </div>
          <Button onClick={() => setShowProjectModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-md mx-auto">
              <h3 className="font-semibold">Error loading projects</h3>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'Something went wrong'}
              </p>
            </div>
          </motion.div>
        ) : !projects || projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-6 text-xl font-semibold">No projects yet</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Create your first internal linking project to start optimizing your website's SEO.
            </p>
            <Button 
              className="mt-6" 
              onClick={() => setShowProjectModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProjectCard 
                  project={project} 
                  jobCount={project.jobs?.[0]?.count || 0}
                  onProjectUpdate={mutate}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <ProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        onSuccess={handleProjectCreated}
      />
    </div>
  )
}