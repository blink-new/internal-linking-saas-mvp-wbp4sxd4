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
import { jobSchema, JobFormData } from '@/lib/validators'
import { Loader2 } from 'lucide-react'

interface AddArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSuccess: () => void
}

export const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
  })

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true)
    try {
      // Insert job
      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
          project_id: projectId,
          title: data.title,
          article_doc: data.article_doc,
          status: 'queued',
          anchors_added: 0,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger job processing (this would call your edge function)
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

      reset()
      onOpenChange(false)
      onSuccess()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <DialogHeader>
            <DialogTitle>Add Article</DialogTitle>
            <DialogDescription>
              Add a Google Docs article to process for internal linking.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Article Title</Label>
              <Input
                id="title"
                placeholder="How to Optimize Your Website"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="article_doc">Google Docs URL</Label>
              <Input
                id="article_doc"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                {...register('article_doc')}
                disabled={isSubmitting}
              />
              {errors.article_doc && (
                <p className="text-sm text-destructive">{errors.article_doc.message}</p>
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
                    Adding...
                  </>
                ) : (
                  'Add Article'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}