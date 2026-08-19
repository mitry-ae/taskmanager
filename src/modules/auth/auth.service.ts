import config from "../../config";
import usersService from "../users/users.service";
import { UnauthorizedError, ValidationError } from "../../common/errors";
import jwt from 'jsonwebtoken'


class AuthService {

    async register(email: string, password: string) {

        const createdUser = await usersService.createUser(email, password)

        return usersService.toPublicUser(createdUser)
    }

    async login(email: string, password: string) {

        const user = await usersService.getUserByEmail(email)

        if (!user) throw new UnauthorizedError()

        const isMatch = await usersService.verifyPassword(user, password)

        if (!isMatch) throw new UnauthorizedError()

        const token = jwt.sign(
            { id: user.id },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES })

        return {
            token,
            user: usersService.toPublicUser(user)
        }
    }
}

export default new AuthService()