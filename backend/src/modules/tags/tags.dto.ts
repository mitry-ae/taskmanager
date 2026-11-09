import {z} from 'zod'

export const createTagSchema = z.object({
    name: z.string().min(1).max(100)
})

export const tagsFiltersShema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(25)
})

export type TagsFilters = z.infer<typeof tagsFiltersShema>

export type CreateTag = z.infer<typeof createTagSchema>