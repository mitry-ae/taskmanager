import { Router } from "express";
import commentsController from "./comments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { verifyTaskOwnership } from "../../middlewares/verifyTaskOwnership.middleware";

const router = Router({mergeParams: true})

router.get('/', authMiddleware, verifyTaskOwnership, commentsController.getComments)
router.post('/', authMiddleware, verifyTaskOwnership, commentsController.createComment)
router.patch('/:commentId', authMiddleware, verifyTaskOwnership, commentsController.updateComment)
router.delete('/:commentId', authMiddleware, verifyTaskOwnership, commentsController.deleteComment)

export default router