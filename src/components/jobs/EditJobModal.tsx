import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { editJobSchema, EditJobFormData } from '@/lib/validators'
import { Database } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

type Job = Database['public']['Tables']['jobs']['Row']

interface EditJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: Job
  onSuccess: () => void
}

export const EditJobModal: React.FC<EditJobModalProps> = ({
  open,
  onOpenChange,
  job,
  onSuccess,
}) => {
  const { toast } = useToast()
  
  const form = useForm<EditJobFormData>({
    resolver: zodResolver(editJobSchema),
    defaultValues: {
      title: job.title,
      article_url: job.article_url || '',
      status: job.status || 'queued',
    },
  })

  const onSubmit = async (data: EditJobFormData) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: data.title,
          article_url: data.article_url || null,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.id)

      if (error) throw error

      toast({
        title: 'Article updated',
        description: 'Your article has been updated successfully.',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating job:', error)
      toast({
        title: 'Error',
        description: 'Failed to update article. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Update your article details. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter article title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="article_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/article"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Anchors Added (Read-only)</FormLabel>
              <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
                {job.anchors_n || 0} anchors
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}