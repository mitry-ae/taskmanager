import {z} from 'zod'

export const createCommentSchema = z.object({
    content: z.string().min(1).max(1000)
})

export const updateCommentSchema = z.object({
    content: z.string().min(1).max(1000)
})

export const commentsFiltersShema = z.object({
    limit: z.coerce.number().min(1).max(100).default(15),
    page: z.coerce.number().min(1).max(100).default(1)
})

export type CommentsFilters = z.infer<typeof commentsFiltersShema>

export type CreateComment = z.infer<typeof createCommentSchema>
export type UpdateComment = z.infer<typeof updateCommentSchema>