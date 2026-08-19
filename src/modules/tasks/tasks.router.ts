import { Router } from "express";
import tasksController from "./tasks.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import commentRouter from '../comments/comments.router'
import { verifyTaskOwnership } from "../../middlewares/verifyTaskOwnership.middleware";

const router = Router()

router.post('/', authMiddleware, tasksController.createTask)
router.get('/', authMiddleware, tasksController.getTasks)
router.get('/stats', authMiddleware, tasksController.getStats)
router.get('/:id', authMiddleware, tasksController.getTaskById)
router.patch('/:id', authMiddleware, tasksController.updateTask)
router.delete('/:id', authMiddleware, tasksController.deleteTask)
router.put('/:taskId/tags', authMiddleware, verifyTaskOwnership, tasksController.replaceTags)

router.use('/:taskId/comments', commentRouter)


export default router