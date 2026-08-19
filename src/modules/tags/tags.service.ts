import { NotFoundError } from "../../common/errors";
import { CreateTag, TagsFilters } from "./tags.dto";
import tagsRepository from "./tags.repository";


class TagsService {
    async createTag(tagPayload: CreateTag, userId: number) {
        const tag = await tagsRepository.createTag(tagPayload, userId)

        return tag
    }

    async getTags(userId: number, filters: TagsFilters) {
        const tags = await tagsRepository.getTags(userId, filters)

        return tags
    }

    async assertAllBelongToUser(userId: number, tagIds: number[]) {
        const ownedIds = await tagsRepository.findOwnedTagIds(userId, tagIds)

        if  (ownedIds.length !== tagIds.length) throw new NotFoundError()
    }

    async deleteTag(userId: number, tagId: number) {
        const deleteTag = await tagsRepository.deleteTag(userId, tagId)

        if (!deleteTag) throw new NotFoundError()

        return true
    }
}

export default new TagsService()