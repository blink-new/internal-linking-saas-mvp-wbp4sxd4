import React from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { projectSchema, ProjectFormData } from '@/lib/validators'
import { Loader2 } from 'lucide-react'

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('projects').insert({
        title: data.title,
        site_url: data.site_url,
        cornerstone_sheet: data.cornerstone_sheet || null,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Project created successfully!',
      })

      reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new internal linking project for your website.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                placeholder="My Website Internal Links"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_url">Website URL</Label>
              <Input
                id="site_url"
                type="url"
                placeholder="https://example.com"
                {...register('site_url')}
                disabled={isSubmitting}
              />
              {errors.site_url && (
                <p className="text-sm text-destructive">{errors.site_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cornerstone_sheet">Cornerstone Sheet (Optional)</Label>
              <Input
                id="cornerstone_sheet"
                type="url"
                placeholder="https://docs.google.com/spreadsheets/..."
                {...register('cornerstone_sheet')}
                disabled={isSubmitting}
              />
              {errors.cornerstone_sheet && (
                <p className="text-sm text-destructive">{errors.cornerstone_sheet.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}