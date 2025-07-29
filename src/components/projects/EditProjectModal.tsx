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
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { editProjectSchema, EditProjectFormData } from '@/lib/validators'
import { Database } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']

interface EditProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSuccess: () => void
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  open,
  onOpenChange,
  project,
  onSuccess,
}) => {
  const { toast } = useToast()
  
  const form = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      site_url: project.site_url,
      cornerstone_sheet: project.cornerstone_sheet || '',
    },
  })

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          site_url: data.site_url,
          cornerstone_sheet: data.cornerstone_sheet || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project.id)

      if (error) throw error

      toast({
        title: 'Project updated',
        description: 'Your project has been updated successfully.',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project settings. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="site_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cornerstone_sheet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cornerstone Sheet URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.google.com/spreadsheets/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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