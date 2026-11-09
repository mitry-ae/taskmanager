import { it, describe, vi, beforeEach, expect } from 'vitest'
import commentsRepository from './comments.repository'
import commentsService from './comments.service'
import { NotFoundError } from '../../common/errors'


vi.mock("./comments.repository", () => ({
    default: {
        createComment: vi.fn(),
        getComments: vi.fn(),
        updateComment: vi.fn(),
        deleteComment: vi.fn()
    }
}))

const comment = {
    id: 6,
    task_id: 2,
    user_id: 3,
    content: "just content",
    created_at: "2026-07-23T09:19:37.469Z"
}

const comments = [
    {
        id: 6,
        task_id: 2,
        user_id: 3,
        content: "just content",
        created_at: "2026-07-23T09:19:37.469Z"
    },
    {
        id: 1,
        task_id: 2,
        user_id: 3,
        content: "just content 2",
        created_at: "2026-07-23T09:19:37.469Z"
    }
]

describe("comments service test", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("createComment return correct comment", async () => {
        vi.mocked(commentsRepository.createComment).mockResolvedValue(comment)

        expect(await commentsService.createComment({ content: comment.content }, 3, 2)).toEqual(comment)
        expect(commentsRepository.createComment).toHaveBeenCalledWith({ content: comment.content }, 3, 2)
    })

    it("getComments return correct comments", async () => {
        vi.mocked(commentsRepository.getComments).mockResolvedValue(comments)

        expect(await commentsService.getComments(3, 2, {limit: 2, page: 1})).toEqual(comments)
        expect(commentsRepository.getComments).toHaveBeenCalledWith(3, 2, {limit: 2, page: 1})
    })

    it("getComments return empty array when comments not found", async () => {
        vi.mocked(commentsRepository.getComments).mockResolvedValue([])

        expect(await commentsService.getComments(3, 2, {limit: 2, page: 1})).toEqual([])
        expect(commentsRepository.getComments).toHaveBeenCalledWith(3, 2, {limit: 2, page: 1})
    })

    it("updateComment return correct comment", async () => {
        vi.mocked(commentsRepository.updateComment).mockResolvedValue(comment)

        expect(await commentsService.updateComment(6, 3, 2, { content: comment.content },)).toEqual(comment)
        expect(commentsRepository.updateComment).toHaveBeenCalledWith(6, 3, 2, { content: comment.content })
    })

    it("updateComment return error if updateComment undefined", async () => {
        vi.mocked(commentsRepository.updateComment).mockResolvedValue(undefined)

        await expect(commentsService.updateComment(6, 3, 2, { content: comment.content },)).rejects.toThrow(NotFoundError)
        expect(commentsRepository.updateComment).toHaveBeenCalledWith(6, 3, 2, { content: comment.content })
    })

    it("deleteComment return true", async () => {
        vi.mocked(commentsRepository.deleteComment).mockResolvedValue(comment)

        expect( await commentsService.deleteComment(6, 3, 2)).toBe(true)
        expect(commentsRepository.deleteComment).toHaveBeenCalledWith(6, 3, 2)
    })

    it("deleteComment return error if comment not found", async () => {
        vi.mocked(commentsRepository.deleteComment).mockResolvedValue(undefined)

        await expect( commentsService.deleteComment(6, 3, 2)).rejects.toThrow(NotFoundError)
        expect(commentsRepository.deleteComment).toHaveBeenCalledWith(6, 3, 2)
    })
})