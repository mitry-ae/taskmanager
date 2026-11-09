"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const errors_1 = require("../../common/errors");
const users_service_1 = __importDefault(require("../users/users.service"));
const auth_service_1 = __importDefault(require("./auth.service"));
const config_1 = __importDefault(require("../../config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
vitest_1.vi.mock('../users/users.service', async () => {
    const actual = await vitest_1.vi.importActual('../users/users.service');
    return {
        default: {
            getUserByEmail: vitest_1.vi.fn(),
            verifyPassword: vitest_1.vi.fn(),
            createUser: vitest_1.vi.fn(),
            toPublicUser: actual.default.toPublicUser
        }
    };
});
vitest_1.vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vitest_1.vi.fn()
    }
}));
const user = {
    id: 1,
    email: "test@test.com",
    password_hash: "hash",
    created_at: new Date()
};
const mockedJwtSign = vitest_1.vi.mocked(jsonwebtoken_1.default.sign);
(0, vitest_1.describe)("auth service test", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("login: user was not found", async () => {
        vitest_1.vi.mocked(users_service_1.default.getUserByEmail).mockResolvedValue(undefined);
        vitest_1.vi.mocked(users_service_1.default.verifyPassword).mockResolvedValue(true);
        await (0, vitest_1.expect)(auth_service_1.default.login("sldkjflskj", "sdlkfj")).rejects.toThrow(errors_1.UnauthorizedError);
        (0, vitest_1.expect)(users_service_1.default.verifyPassword).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("login: password is incorrect. UnauthorizedError", async () => {
        vitest_1.vi.mocked(users_service_1.default.getUserByEmail).mockResolvedValue(user);
        vitest_1.vi.mocked(users_service_1.default.verifyPassword).mockResolvedValue(false);
        await (0, vitest_1.expect)(auth_service_1.default.login("test@test.com", "pass")).rejects.toThrow(errors_1.UnauthorizedError);
        (0, vitest_1.expect)(users_service_1.default.verifyPassword).toHaveBeenCalled();
    });
    (0, vitest_1.it)("all correct, return token and user", async () => {
        vitest_1.vi.mocked(users_service_1.default.getUserByEmail).mockResolvedValue(user);
        vitest_1.vi.mocked(users_service_1.default.verifyPassword).mockResolvedValue(true);
        mockedJwtSign.mockReturnValue("token");
        const result = await auth_service_1.default.login("email", "pass");
        (0, vitest_1.expect)(typeof result.token).toBe("string");
        (0, vitest_1.expect)(result.user).not.toHaveProperty("password_hash");
    });
    (0, vitest_1.it)("register return is correct user", async () => {
        vitest_1.vi.mocked(users_service_1.default.createUser).mockResolvedValue(user);
        const publicUser = users_service_1.default.toPublicUser(user);
        const result = await auth_service_1.default.register(user.email, "qwerty");
        (0, vitest_1.expect)(users_service_1.default.createUser).toHaveBeenCalledWith(user.email, "qwerty");
        (0, vitest_1.expect)(result).toEqual({ id: user.id, email: user.email, createdAt: user.created_at });
    });
    (0, vitest_1.it)("login return correct jwt token", async () => {
        mockedJwtSign.mockReturnValue("token");
        vitest_1.vi.mocked(users_service_1.default.getUserByEmail).mockResolvedValue(user);
        vitest_1.vi.mocked(users_service_1.default.verifyPassword).mockResolvedValue(true);
        await auth_service_1.default.login(user.email, "qwerty");
        (0, vitest_1.expect)(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ id: user.id }, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES });
    });
});
