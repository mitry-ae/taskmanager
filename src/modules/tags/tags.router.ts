import { Router } from "express";
import tagsController from "./tags.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router()

router.get('/', authMiddleware, tagsController.getTags)
router.post('/', authMiddleware, tagsController.createTag)
router.delete('/:id', authMiddleware, tagsController.deleteTag)


export default router
