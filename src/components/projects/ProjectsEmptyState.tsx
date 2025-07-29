import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen } from 'lucide-react'

interface ProjectsEmptyStateProps {
  onCreateProject: () => void
}

export const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = ({ onCreateProject }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
      <FolderOpen className="w-12 h-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold">No projects yet</h3>
    <p className="mt-2 text-muted-foreground max-w-md mx-auto">
      Create your first internal linking project to start optimizing your website's SEO.
    </p>
    <Button className="mt-6" onClick={onCreateProject}>
      <Plus className="mr-2 h-4 w-4" />
      Create Your First Project
    </Button>
  </motion.div>
)