import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title too long'),
  site_url: z.string().url('Please enter a valid URL'),
  cornerstone_sheet: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

export const jobSchema = z.object({
  title: z.string().min(1, 'Article title is required').max(200, 'Title too long'),
  article_doc: z.string().url('Please enter a valid Google Docs URL')
})

export const editProjectSchema = z.object({
  cornerstone_sheet: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  site_url: z.string().url('Please enter a valid URL')
})

export const editJobSchema = z.object({
  title: z.string().min(1, 'Article title is required').max(200, 'Title too long'),
  article_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  status: z.enum(['queued', 'processing', 'done', 'error'])
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type JobFormData = z.infer<typeof jobSchema>
export type EditProjectFormData = z.infer<typeof editProjectSchema>
export type EditJobFormData = z.infer<typeof editJobSchema>