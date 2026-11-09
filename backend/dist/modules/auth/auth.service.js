"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../../config"));
const users_service_1 = __importDefault(require("../users/users.service"));
const errors_1 = require("../../common/errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    async register(email, password) {
        const createdUser = await users_service_1.default.createUser(email, password);
        return users_service_1.default.toPublicUser(createdUser);
    }
    async login(email, password) {
        const user = await users_service_1.default.getUserByEmail(email);
        if (!user)
            throw new errors_1.UnauthorizedError();
        const isMatch = await users_service_1.default.verifyPassword(user, password);
        if (!isMatch)
            throw new errors_1.UnauthorizedError();
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES });
        return {
            token,
            user: users_service_1.default.toPublicUser(user)
        };
    }
}
exports.default = new AuthService();
