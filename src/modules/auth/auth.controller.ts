import { type Request, type Response } from "express";
import authService from "./auth.service";
import { AppError, ValidationError } from "../../common/errors";
import { registerSchema, loginSchema } from "./auth.dto";
import { z } from 'zod'

class AuthController {

    async register(req: Request, res: Response) {
            const result = registerSchema.safeParse(req.body)

            if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

            const { email, password } = result.data
            const createdUser = await authService.register(email, password)
            res.json(createdUser)
    }

    async login(req: Request, res: Response) {
            const result = loginSchema.safeParse(req.body)

             if (!result.success) throw new ValidationError(result.error.issues[0]?.message)
            
            const { email, password } = result.data

            const { user, token } = await authService.login(email, password)
            res.json({ status: "success login", data: { user, token } })
    }
}

export default new AuthController()