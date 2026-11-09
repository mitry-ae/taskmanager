"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_repository_1 = __importDefault(require("./users.repository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const errors_1 = require("../../common/errors");
class UsersService {
    async createUser(email, password) {
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        return await users_repository_1.default.createUser(email, passwordHash);
    }
    async getUserByEmail(email) {
        const user = await users_repository_1.default.getUserByEmail(email);
        return user;
    }
    async getUserById(id) {
        const user = await users_repository_1.default.getUserById(id);
        if (!user)
            throw new errors_1.NotFoundError();
        return this.toPublicUser(user);
    }
    toPublicUser(user) {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at
        };
    }
    async verifyPassword(user, password) {
        return await bcrypt_1.default.compare(password, user.password_hash);
    }
}
exports.default = new UsersService();
