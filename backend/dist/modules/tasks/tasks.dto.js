"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskPayloadSchema = exports.replaceTagsSchema = exports.taskFiltersSchema = exports.taskPayloadSchema = void 0;
const zod_1 = require("zod");
exports.taskPayloadSchema = zod_1.z.object({
    title: zod_1.z.string().min(4).max(100),
    description: zod_1.z.string().optional(),
    priority: zod_1.z.enum(["low", "medium", "high"]).optional(),
    due_date: zod_1.z.coerce.date().optional()
});
let statusTaskSchema = zod_1.z.enum(["todo", "in_progress", "done"]).optional();
exports.taskFiltersSchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().max(100).default(15),
    page: zod_1.z.coerce.number().default(1),
    status: statusTaskSchema,
    sort: zod_1.z.enum(["due_date", "priority", "title", "created_at"]).default("created_at"),
    order: zod_1.z.enum(["asc", "desc"]).default("desc"),
    search: zod_1.z.string().max(200).optional()
});
exports.replaceTagsSchema = zod_1.z.object({
    tagIds: zod_1.z.array(zod_1.z.number().int().positive())
});
exports.UpdateTaskPayloadSchema = exports.taskPayloadSchema.partial().extend({ status: statusTaskSchema });
