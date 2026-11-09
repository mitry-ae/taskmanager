"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const errors_1 = require("../../common/errors");
const auth_dto_1 = require("./auth.dto");
class AuthController {
    async register(req, res) {
        const result = auth_dto_1.registerSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const { email, password } = result.data;
        const createdUser = await auth_service_1.default.register(email, password);
        res.json(createdUser);
    }
    async login(req, res) {
        const result = auth_dto_1.loginSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const { email, password } = result.data;
        const { user, token } = await auth_service_1.default.login(email, password);
        res.json({ status: "success login", data: { user, token } });
    }
}
exports.default = new AuthController();
