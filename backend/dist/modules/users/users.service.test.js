"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const errors_1 = require("../../common/errors");
const users_service_1 = __importDefault(require("../users/users.service"));
const users_repository_1 = __importDefault(require("./users.repository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
vitest_1.vi.mock('./users.repository', () => ({
    default: {
        getUserById: vitest_1.vi.fn(),
        createUser: vitest_1.vi.fn(),
        getUserByEmail: vitest_1.vi.fn()
    }
}));
vitest_1.vi.mock('bcrypt', () => ({
    default: {
        compare: vitest_1.vi.fn(),
        hash: vitest_1.vi.fn()
    }
}));
const user = {
    id: 1,
    email: "test@test.com",
    password_hash: "hash",
    created_at: new Date()
};
(0, vitest_1.describe)("users service test", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("getUserById returned NotFoundError with null", async () => {
        vitest_1.vi.mocked(users_repository_1.default.getUserById).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(users_service_1.default.getUserById(1)).rejects.toThrow(errors_1.NotFoundError);
    });
    (0, vitest_1.it)("getUserById returned corrected user without passwrod_hash", async () => {
        vitest_1.vi.mocked(users_repository_1.default.getUserById).mockResolvedValue(user);
        const result = await users_service_1.default.getUserById(1);
        (0, vitest_1.expect)(result).not.toHaveProperty("password_hash");
    });
    (0, vitest_1.it)("toPrivateUser returned corrected user without passwrod_hash", () => {
        const result = users_service_1.default.toPublicUser(user);
        (0, vitest_1.expect)(result).not.toHaveProperty("password_hash");
    });
    (0, vitest_1.it)("verifyPassword correct verify true", async () => {
        vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(true);
        (0, vitest_1.expect)(await users_service_1.default.verifyPassword(user, "pass")).toBe(true);
        (0, vitest_1.expect)(bcrypt_1.default.compare).toHaveBeenCalledWith("pass", "hash");
    });
    (0, vitest_1.it)("verifyPassword correct verify false", async () => {
        vitest_1.vi.mocked(bcrypt_1.default.compare).mockResolvedValue(false);
        (0, vitest_1.expect)(await users_service_1.default.verifyPassword(user, "pass")).toBe(false);
        (0, vitest_1.expect)(bcrypt_1.default.compare).toHaveBeenCalledWith("pass", "hash");
    });
    (0, vitest_1.it)("bcrypt.hash use pass", async () => {
        vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
        const email = user.email;
        const pass = "qwerty";
        await users_service_1.default.createUser(email, pass);
        (0, vitest_1.expect)(bcrypt_1.default.hash).toHaveBeenCalledWith(pass, 10);
    });
    (0, vitest_1.it)("usersRepository.createUser call with email and real pass no save", async () => {
        vitest_1.vi.mocked(bcrypt_1.default.hash).mockResolvedValue("hash");
        vitest_1.vi.mocked(users_repository_1.default.createUser).mockResolvedValue(user);
        const email = user.email;
        const pass = "qwerty";
        await users_service_1.default.createUser(email, pass);
        (0, vitest_1.expect)(users_repository_1.default.createUser).toHaveBeenCalledWith(email, "hash");
    });
    (0, vitest_1.it)("getUserByEmail return correct user", async () => {
        vitest_1.vi.mocked(users_repository_1.default.getUserByEmail).mockResolvedValue(user);
        (0, vitest_1.expect)(await users_service_1.default.getUserByEmail(user.email)).toEqual(user);
    });
    (0, vitest_1.it)("getUserByEmail return undefined if user not found", async () => {
        vitest_1.vi.mocked(users_repository_1.default.getUserByEmail).mockResolvedValue(undefined);
        (0, vitest_1.expect)(await users_service_1.default.getUserByEmail(user.email)).toBe(undefined);
    });
    (0, vitest_1.it)("createUser return error if db crashed", async () => {
        const conflictError = new errors_1.ConflictError("Conflict Error");
        vitest_1.vi.mocked(users_repository_1.default.createUser).mockRejectedValue(conflictError);
        await (0, vitest_1.expect)(users_service_1.default.createUser(user.email, "qwerty")).rejects.toThrow(errors_1.ConflictError);
    });
});
