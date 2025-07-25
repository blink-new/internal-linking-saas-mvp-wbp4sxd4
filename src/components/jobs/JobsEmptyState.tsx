import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'

interface JobsEmptyStateProps {
  onAddArticle: () => void
}

export const JobsEmptyState: React.FC<JobsEmptyStateProps> = ({ onAddArticle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
      <FileText className="w-12 h-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold">No articles yet</h3>
    <p className="mt-2 text-muted-foreground max-w-md mx-auto">
      Add your first Google Doc article to start the internal linking process.
    </p>
    <Button className="mt-6" onClick={onAddArticle}>
      <Plus className="mr-2 h-4 w-4" />
      Add Your First Article
    </Button>
  </motion.div>
)