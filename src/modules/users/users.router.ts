import { Router } from "express";
import usersController from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router()


router.get('/me', authMiddleware, usersController.getMe)

export default router