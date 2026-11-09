"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.AccessError = exports.NotFoundError = exports.ValidationError = exports.UnauthorizedError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
class UnauthorizedError extends AppError {
    constructor(message = "Invalid credentials") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ValidationError extends AppError {
    constructor(message = "Validation Error") {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class AccessError extends AppError {
    constructor(message = "Access error") {
        super(message, 403);
    }
}
exports.AccessError = AccessError;
class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
