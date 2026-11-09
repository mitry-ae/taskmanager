"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const up = async (pgm) => {
    pgm.createTable("users", {
        id: "id",
        email: { type: "varchar(255)", notNull: true, unique: true },
        password_hash: { type: "varchar(255)", notNull: true },
        created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
    });
};
exports.up = up;
const down = async (pgm) => {
    pgm.dropTable("users");
};
exports.down = down;
