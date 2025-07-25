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

export type ProjectFormData = z.infer<typeof projectSchema>
export type JobFormData = z.infer<typeof jobSchema>