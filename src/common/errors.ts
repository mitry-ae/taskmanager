
class AppError extends Error {

    constructor(message: string, public statusCode: number) {
        super(message)
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Invalid credentials") {
        super(message, 401)
    }
}

class ValidationError extends AppError {
    constructor (message = "Validation Error") {
        super(message, 400)
    }
}

class NotFoundError extends AppError {
    constructor (message = "Resource not found") {
        super(message, 404)
    }
}

class AccessError extends AppError {
    constructor (message = "Access error") {
        super(message, 403)
    }
}

class ConflictError extends AppError {
    constructor (message = "Resource already exists") {
        super(message, 409)
    }
}

export {
    AppError,
    UnauthorizedError,
    ValidationError,
    NotFoundError,
    AccessError,
    ConflictError
}