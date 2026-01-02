import { z } from 'zod'

export type Page = {
  id: string
  title: string
  content: PageContent
  created_at: string
  updated_at: string
  user_id: string
}

export type PageContent = {
  type?: string
  content?: unknown[]
  [key: string]: unknown
}

export const pageContentSchema = z.object({
  type: z.string().optional(),
  content: z.array(z.unknown()).optional()
}).passthrough()

export const pageSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(200).default(''),
  content: pageContentSchema.default({}),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().uuid().optional()
})
