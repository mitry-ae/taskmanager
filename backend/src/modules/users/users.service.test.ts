import { it, describe, expect, vi, beforeEach } from 'vitest'
import { ConflictError, NotFoundError } from '../../common/errors';
import usersService from "../users/users.service";
import usersRepository from './users.repository';
import bcrypt from "bcrypt"


vi.mock('./users.repository', () => ({
    default: {
        getUserById: vi.fn(),
        createUser: vi.fn(),
        getUserByEmail: vi.fn()
    }
}))

vi.mock('bcrypt', () => ({
    default: {
        compare: vi.fn<(data: string, encrypted: string) => Promise<boolean>>(),
        hash: vi.fn<(data: string, saltRounds: number) => Promise<string>>()
    }
}))

const user = {
    id: 1,
    email: "test@test.com",
    password_hash: "hash",
    created_at: new Date()
}


describe("users service test", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("getUserById returned NotFoundError with null", async () => {
        vi.mocked(usersRepository.getUserById).mockResolvedValue(undefined)

        await expect(usersService.getUserById(1)).rejects.toThrow(NotFoundError)


    })

    it("getUserById returned corrected user without passwrod_hash", async () => {
        vi.mocked(usersRepository.getUserById).mockResolvedValue(user)

        const result = await usersService.getUserById(1)

        expect(result).not.toHaveProperty("password_hash")
    })

    it("toPrivateUser returned corrected user without passwrod_hash", () => {

        const result = usersService.toPublicUser(user)

        expect(result).not.toHaveProperty("password_hash")
    })

    it("verifyPassword correct verify true", async () => {
        vi.mocked(bcrypt.compare as (data: string, encrypted: string) => Promise<boolean>).mockResolvedValue(true)

        expect(await usersService.verifyPassword(user, "pass")).toBe(true)
        expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hash")
    })

    it("verifyPassword correct verify false", async () => {
        vi.mocked(bcrypt.compare as (data: string, encrypted: string) => Promise<boolean>).mockResolvedValue(false)

        expect(await usersService.verifyPassword(user, "pass")).toBe(false)
        expect(bcrypt.compare).toHaveBeenCalledWith("pass", "hash")
    })

    it("bcrypt.hash use pass", async () => {
        vi.mocked(bcrypt.hash as (data: string, saltRounds: number) => Promise<string>).mockResolvedValue("hash")
        const email = user.email
        const pass = "qwerty"
        await usersService.createUser(email, pass)
        expect(bcrypt.hash).toHaveBeenCalledWith(pass, 10)
    })

    it("usersRepository.createUser call with email and real pass no save", async () => {
        vi.mocked(bcrypt.hash as (data: string, saltRounds: number) => Promise<string>).mockResolvedValue("hash")
        vi.mocked(usersRepository.createUser).mockResolvedValue(user)
        const email = user.email
        const pass = "qwerty"
        await usersService.createUser(email, pass)
        expect(usersRepository.createUser).toHaveBeenCalledWith(email, "hash")
    })

    it("getUserByEmail return correct user", async () => {
        vi.mocked(usersRepository.getUserByEmail).mockResolvedValue(user)

        expect(await usersService.getUserByEmail(user.email)).toEqual(user)
    })

    it("getUserByEmail return undefined if user not found", async () => {
        vi.mocked(usersRepository.getUserByEmail).mockResolvedValue(undefined)

        expect(await usersService.getUserByEmail(user.email)).toBe(undefined)
    })

    it("createUser return error if db crashed", async () => {

        const conflictError = new ConflictError("Conflict Error")
        vi.mocked(usersRepository.createUser).mockRejectedValue(conflictError)

        await expect(usersService.createUser(user.email, "qwerty")).rejects.toThrow(ConflictError)
    })

})