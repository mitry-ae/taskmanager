"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
function requireDuration(name) {
    const value = requireEnv(name);
    if (!/^\d+(\.\d+)?\s*(ms|s|m|h|d|w|y)$/i.test(value)) {
        throw new Error(`${name} must be a valid duration string (e.g. "1h"), got "${value}"`);
    }
    return value;
}
const PORT = requireEnv("PORT");
const DATABASE_URL = requireEnv("DATABASE_URL");
const JWT_SECRET = requireEnv("JWT_SECRET");
const JWT_EXPIRES = requireDuration("JWT_EXPIRES");
exports.default = {
    PORT,
    DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES
};
