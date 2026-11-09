import { type Response, type Request, type NextFunction } from "express";
import { UnauthorizedError, ValidationError } from "../../common/errors";
import { createTagSchema, tagsFiltersShema } from "./tags.dto";
import tagsService from "./tags.service";
import tagsRepository from "./tags.repository";

class TagsController {
    async getTags(req: Request, res: Response, next: NextFunction) {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const resultValid = tagsFiltersShema.safeParse(req.query)
        if (!resultValid.success) throw new ValidationError(resultValid.error.issues[0]?.message)

        const tags = await tagsService.getTags(userPayload.id, resultValid.data)

        res.json({status: "success", data: {
            tags
        }})

    }

    async createTag(req: Request, res: Response, next: NextFunction) {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const resultValid = createTagSchema.safeParse(req.body)

        if (!resultValid.success) throw new ValidationError(resultValid.error.issues[0]?.message)

        const tag = await tagsService.createTag(resultValid.data, userPayload.id)

        res.json({ status: "success", data: { tag } })
    }

    async deleteTag(req: Request, res: Response, next: NextFunction) {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()
        
        const tagId = Number(req.params.id)
        if (!tagId) throw new ValidationError("expected taskId")

        await tagsService.deleteTag(userPayload.id, tagId)

        return res.json({status: "success", data: {message: "Tag was deleted"}})
    }
}

export default new TagsController()