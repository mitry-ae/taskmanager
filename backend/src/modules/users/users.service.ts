import usersRepository from "./users.repository"
import { type UserRow } from "./users.dto"
import bcrypt from "bcrypt"
import { NotFoundError } from "../../common/errors"

class UsersService {

    async createUser(email: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 10)

        return await usersRepository.createUser(email, passwordHash)
    }

    async getUserByEmail(email: string) {
        const user = await usersRepository.getUserByEmail(email)
        return user
    }

    async getUserById(id: number) {
        const user = await usersRepository.getUserById(id)
        if (!user) throw new NotFoundError()

        return this.toPublicUser(user)
    }

    toPublicUser(user: UserRow) {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at
        }
    }

    async verifyPassword( user: UserRow, password: string) {
        return await bcrypt.compare(password, user.password_hash)
    }
}

export default new UsersService()