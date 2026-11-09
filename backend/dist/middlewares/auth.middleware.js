"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const config_1 = __importDefault(require("../config"));
const errors_1 = require("../common/errors");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token)
        return next(new errors_1.UnauthorizedError("Authentication token is missing"));
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        if (typeof payload === 'string' || typeof payload.id !== 'number')
            return next(new errors_1.UnauthorizedError());
        req.user = { id: payload.id };
        next();
    }
    catch (err) {
        next(new errors_1.UnauthorizedError("Invalid or expired token"));
    }
}
