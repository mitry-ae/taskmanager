"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_service_1 = __importDefault(require("./users.service"));
const errors_1 = require("../../common/errors");
class UsersController {
    async getMe(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const user = await users_service_1.default.getUserById(userPayload.id);
        res.json(user);
    }
}
exports.default = new UsersController();
