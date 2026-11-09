import pool from "../../db/pool";
import { type UserRow } from "./users.dto";
import { ConflictError } from "../../common/errors";

class UsersRepository {
    async createUser(email: string, passwordHash: string): Promise<UserRow> {
        const query = {
            text: "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at;",
            values: [email, passwordHash]
        }
        try {

            const { rows } = await pool.query(query)

            return rows[0]
        } catch (err: any) {
            if (err?.code === '23505') {
                throw new ConflictError("Email already in use")
            }
            throw err
        }
    }

    async getUserByEmail(email: string): Promise<UserRow | undefined> {
        const query = {
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        }
        const { rows } = await pool.query(query)

        return rows[0]
    }

    async getUserById(id: number): Promise<UserRow | undefined> {
        const query = {
            text: "SELECT * FROM users WHERE id = $1",
            values: [id]
        }
        const { rows } = await pool.query(query)

        return rows[0]
    }
}

export default new UsersRepository()