import {z} from 'zod'

const emailSchema = z.email("Email format is invalid")
  .min(6, "Email must be at least 6 characters")
  .max(50, "Email must be at most 50 characters");

let loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1)
})

let registerSchema = z.object({
    email: emailSchema,
    password: z.string().min(6).max(50)
})

export {
    loginSchema,
    registerSchema
}