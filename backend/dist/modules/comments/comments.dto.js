"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsFiltersShema = exports.updateCommentSchema = exports.createCommentSchema = void 0;
const zod_1 = require("zod");
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000)
});
exports.updateCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000)
});
exports.commentsFiltersShema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).default(15),
    page: zod_1.z.coerce.number().min(1).max(100).default(1)
});
