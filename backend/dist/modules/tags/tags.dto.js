"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsFiltersShema = exports.createTagSchema = void 0;
const zod_1 = require("zod");
exports.createTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100)
});
exports.tagsFiltersShema = zod_1.z.object({
    page: zod_1.z.coerce.number().default(1),
    limit: zod_1.z.coerce.number().default(25)
});
