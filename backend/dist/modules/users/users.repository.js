"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../db/pool"));
const errors_1 = require("../../common/errors");
class UsersRepository {
    async createUser(email, passwordHash) {
        const query = {
            text: "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at;",
            values: [email, passwordHash]
        };
        try {
            const { rows } = await pool_1.default.query(query);
            return rows[0];
        }
        catch (err) {
            if (err?.code === '23505') {
                throw new errors_1.ConflictError("Email already in use");
            }
            throw err;
        }
    }
    async getUserByEmail(email) {
        const query = {
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        };
        const { rows } = await pool_1.default.query(query);
        return rows[0];
    }
    async getUserById(id) {
        const query = {
            text: "SELECT * FROM users WHERE id = $1",
            values: [id]
        };
        const { rows } = await pool_1.default.query(query);
        return rows[0];
    }
}
exports.default = new UsersRepository();
