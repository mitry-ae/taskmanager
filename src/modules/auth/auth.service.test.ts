import { it, test, describe, expect, vi, beforeEach } from 'vitest'
import { UnauthorizedError } from '../../common/errors';
import usersService from "../users/users.service";
import authService from './auth.service';
import config from '../../config';
import jwt from 'jsonwebtoken'
import { type Secret } from 'jsonwebtoken';

vi.mock('../users/users.service', async () => {
    const actual = await vi.importActual<typeof import('../users/users.service')>('../users/users.service')
    return {
        default: {
            getUserByEmail: vi.fn(),
            verifyPassword: vi.fn(),
            createUser: vi.fn(),
            toPublicUser: actual.default.toPublicUser
        }
    }
})

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn()
    }
}))

const user = {
    id: 1,
    email: "test@test.com",
    password_hash: "hash",
    created_at: new Date()
}

const mockedJwtSign = vi.mocked(jwt.sign as (payload: object, secretOrPrivateKey: Secret) => string)

describe("auth service test", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("login: user was not found", async () => {
        vi.mocked(usersService.getUserByEmail).mockResolvedValue(undefined)

        vi.mocked(usersService.verifyPassword).mockResolvedValue(true)

        await expect(authService.login("sldkjflskj", "sdlkfj")).rejects.toThrow(UnauthorizedError)
        expect(usersService.verifyPassword).not.toHaveBeenCalled()
    })

    it("login: password is incorrect. UnauthorizedError", async () => {

        vi.mocked(usersService.getUserByEmail).mockResolvedValue(user)

        vi.mocked(usersService.verifyPassword).mockResolvedValue(false)

        await expect(authService.login("test@test.com", "pass")).rejects.toThrow(UnauthorizedError)
        expect(usersService.verifyPassword).toHaveBeenCalled()
    })

    it("all correct, return token and user", async () => {

        vi.mocked(usersService.getUserByEmail).mockResolvedValue(user)
        vi.mocked(usersService.verifyPassword).mockResolvedValue(true)
        mockedJwtSign.mockReturnValue("token")

        const result = await authService.login("email", "pass")
        expect(typeof result.token).toBe("string")
        expect(result.user).not.toHaveProperty("password_hash")
    })

    it("register return is correct user", async () => {
        vi.mocked(usersService.createUser).mockResolvedValue(user)
        const publicUser = usersService.toPublicUser(user)

        const result = await authService.register(user.email, "qwerty")

        expect(usersService.createUser).toHaveBeenCalledWith(user.email, "qwerty")
        expect(result).toEqual({ id: user.id, email: user.email, createdAt: user.created_at })
    })

    it("login return correct jwt token", async () => {
        mockedJwtSign.mockReturnValue("token")
        vi.mocked(usersService.getUserByEmail).mockResolvedValue(user)
        vi.mocked(usersService.verifyPassword).mockResolvedValue(true)

        await authService.login(user.email, "qwerty")

        expect(jwt.sign).toHaveBeenCalledWith({ id: user.id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES })
    })
})