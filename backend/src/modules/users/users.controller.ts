import { NextFunction, type Request, type Response } from "express";
import usersService from "./users.service";
import { AppError, UnauthorizedError } from "../../common/errors";

class UsersController {

    async getMe(req: Request, res: Response, next: NextFunction) {
            const userPayload = req.user
            if (!userPayload) throw new UnauthorizedError()

            const user = await usersService.getUserById(userPayload.id)

            res.json(user)

    }
}

export default new UsersController()