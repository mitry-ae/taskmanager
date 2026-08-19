import { type Response, type Request, type NextFunction } from "express"
import { commentsFiltersShema, createCommentSchema, updateCommentSchema } from "./comments.dto"
import commentsService from "./comments.service"
import { NotFoundError, UnauthorizedError, ValidationError } from "../../common/errors"


class CommentsController {
    createComment = async (req: Request, res: Response) => {

        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const taskId = Number(req.params.taskId)

        const result = createCommentSchema.safeParse(req.body)
        if (!result.success) {
            throw new ValidationError(result.error.issues[0]?.message)
        }
        const comment = result.data

        const createdComment = await commentsService.createComment(comment, userPayload.id, taskId)

        res.json({ status: "success", data: { comment: createdComment } })
    }

    getComments = async (req: Request, res: Response) => {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const taskId = Number(req.params.taskId)

        const result = commentsFiltersShema.safeParse(req.query)
        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

        const comments = await commentsService.getComments(userPayload.id, taskId, result.data)
        res.json({ status: "success", data: { comments } })
    }

    updateComment = async (req: Request, res: Response) => {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const taskId = Number(req.params.taskId)

        const commentId = Number(req.params.commentId)
        if (!commentId) throw new ValidationError("Comment id is invalid")

        const result = updateCommentSchema.safeParse(req.body)
        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

        const updatedComment = await commentsService.updateComment(commentId, userPayload.id, taskId, result.data)

        res.json({ status: "success", data: {comment: updatedComment }})
    }

    deleteComment = async (req: Request, res: Response) => {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const taskId = Number(req.params.taskId)

        const commentId = Number(req.params.commentId)
        if (!commentId) throw new ValidationError("Comment id is invalid")

        const deletedComment = await commentsService.deleteComment(commentId, userPayload.id, taskId)

        res.json({ status: "success", data: deletedComment })
    }
}

export default new CommentsController()