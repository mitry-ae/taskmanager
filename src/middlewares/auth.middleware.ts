import config from "../config";
import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedError } from "../common/errors";
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {

    const token = req.headers.authorization?.split("Bearer ")[1]
    if (!token) return next(new UnauthorizedError("Authentication token is missing"))

    try {
        const payload = jwt.verify(token, config.JWT_SECRET)
        if (typeof payload === 'string' || typeof payload.id !== 'number') return next(new UnauthorizedError())
        req.user = {id: payload.id}
        
        next()
    } catch (err) {
        next(new UnauthorizedError("Invalid or expired token"))
    }
}