"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const emailSchema = zod_1.z.email("Email format is invalid")
    .min(6, "Email must be at least 6 characters")
    .max(50, "Email must be at most 50 characters");
let loginSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(1)
});
exports.loginSchema = loginSchema;
let registerSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(6).max(50)
});
exports.registerSchema = registerSchema;
