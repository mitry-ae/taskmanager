import { beforeEach, describe, expect, it, vi } from 'vitest'
import tagsService from './tags.service'
import tagsRepository from './tags.repository'
import { CreateTag } from './tags.dto'
import { NotFoundError } from '../../common/errors'

vi.mock("./tags.repository", () => ({
    default: {
        createTag: vi.fn(),
        getTags: vi.fn(),
        deleteTag: vi.fn(),
        findOwnedTagIds: vi.fn()
    }
}))

const tag = {
    id: 1,
    user_id: 1,
    name: "tag title"
}

const tags = [
    {
        id: 1,
        user_id: 1,
        name: "tag title",
    },
    {
        id: 2,
        user_id: 1,
        name: "tag title 2"
    }

]

describe("tags service test", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("create tag return correct tag", async () => {
        vi.mocked(tagsRepository.createTag).mockResolvedValue(tag)
        const tagPayload = { name: tag.name } as CreateTag
        expect(await tagsService.createTag(tagPayload, 1)).toEqual(tag)
        expect(tagsRepository.createTag).toHaveBeenCalledWith(tagPayload, 1)
    })

    it("get tags return correct tags array", async () => {
        vi.mocked(tagsRepository.getTags).mockResolvedValue(tags)

        const filters = {
            limit: 10,
            page: 1
        }

        expect(await tagsService.getTags(1, filters)).toEqual(tags)
        expect(tagsRepository.getTags).toHaveBeenCalledWith(1, filters)
    })

    it("delete tag return true", async () => {
        vi.mocked(tagsRepository.deleteTag).mockResolvedValue(true)

        expect(await tagsService.deleteTag(1, 1)).toBe(true)
        expect(tagsRepository.deleteTag).toHaveBeenCalledWith(1, 1)
    })

    it("delete tag return not found error", async () => {
        vi.mocked(tagsRepository.deleteTag).mockResolvedValue(undefined)

        await expect(tagsService.deleteTag(1, 1)).rejects.toThrow(NotFoundError)
        expect(tagsRepository.deleteTag).toHaveBeenCalledWith(1, 1)
    })

    it("assertAllBelongToUser no create error if all ok", async () => {
        vi.mocked(tagsRepository.findOwnedTagIds).mockResolvedValue([1,2,3])

        await tagsService.assertAllBelongToUser(1, [1, 2, 3])

        expect(tagsRepository.findOwnedTagIds).toHaveBeenCalledWith(1, [1, 2 ,3])
    })

    it("assertAllBelongToUser create not found error ", async () => {
        vi.mocked(tagsRepository.findOwnedTagIds).mockResolvedValue([1,2])

        await expect( tagsService.assertAllBelongToUser(1, [1, 2, 3])).rejects.toThrow(NotFoundError)

        expect(tagsRepository.findOwnedTagIds).toHaveBeenCalledWith(1, [1, 2 ,3])
    })
})