"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const errors_1 = require("../common/errors");
const logger_1 = __importDefault(require("../logger"));
function errorMiddleware(err, req, res, next) {
    if (isBodyParseError(err) && err.type === 'entity.parse.failed') {
        return res.status(400).json({ status: "error", message: "JSON invalid" });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ status: "error", message: err.message });
    }
    else {
        logger_1.default.error({ err, requestId: res.locals.requestId }, 'unhandled error');
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
}
function isBodyParseError(err) {
    return err !== null && typeof err === 'object' && 'type' in err;
}
