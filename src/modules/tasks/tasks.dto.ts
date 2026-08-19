
import {number, z} from 'zod'


export const taskPayloadSchema = z.object({
    title: z.string().min(4).max(100),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    due_date: z.coerce.date().optional()
})

let statusTaskSchema = z.enum(["todo", "in_progress", "done"]).optional()

export const taskFiltersSchema = z.object({
    limit: z.coerce.number().max(100).default(15),
    page: z.coerce.number().default(1),
    status: statusTaskSchema,
    sort: z.enum(["due_date", "priority", "title", "created_at"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().max(200).optional()
})

export const replaceTagsSchema = z.object({
    tagIds: z.array(z.number().int().positive())
})

export type StatusTask = z.infer<typeof statusTaskSchema>

export const UpdateTaskPayloadSchema = taskPayloadSchema.partial().extend({status:statusTaskSchema})

export type TaskPayload = z.infer<typeof taskPayloadSchema>

export type TaskFilters = z.infer<typeof taskFiltersSchema>

export type UpdateTaskPayload = z.infer<typeof UpdateTaskPayloadSchema>

export type ReplaceTags = z.infer<typeof replaceTagsSchema>