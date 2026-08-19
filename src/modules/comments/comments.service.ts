import { NotFoundError } from "../../common/errors"
import { CommentsFilters, UpdateComment, type CreateComment } from "./comments.dto"
import commentsRepository from "./comments.repository"

class CommentsService {
    createComment = async (comment: CreateComment, user_id: number, task_id: number) => {

        return await commentsRepository.createComment(comment, user_id, task_id)
    }

    getComments = async (user_id: number, task_id: number, filters: CommentsFilters) => {
        return await commentsRepository.getComments(user_id, task_id, filters)
    }

    updateComment = async (id: number, user_id: number, task_id: number, updateComment: UpdateComment) => {
        const comment = await commentsRepository.updateComment(id, user_id, task_id, updateComment)
        if (!comment) throw new NotFoundError()
        return comment
    }

    deleteComment = async (id:number, user_id: number, task_id: number) => {
        const comment = await commentsRepository.deleteComment(id, user_id, task_id)
         if (!comment) throw new NotFoundError()
        return true
    }
}

export default new CommentsService()