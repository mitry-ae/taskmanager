import 'dotenv/config'
import type {StringValue} from 'ms'

function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

function requireDuration(name: string) {
    const value = requireEnv(name)
    if (!/^\d+(\.\d+)?\s*(ms|s|m|h|d|w|y)$/i.test(value)) {
        throw new Error(`${name} must be a valid duration string (e.g. "1h"), got "${value}"`)
    }

    return value as StringValue
}

const PORT = requireEnv("PORT")

const DATABASE_URL = requireEnv("DATABASE_URL")
const JWT_SECRET = requireEnv("JWT_SECRET")
const JWT_EXPIRES = requireDuration("JWT_EXPIRES")

export default {
    PORT,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES
}