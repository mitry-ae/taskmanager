"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.createTable("task_comments", {
        id: "id",
        task_id: { type: "int", notNull: true, references: "tasks", onDelete: "CASCADE" },
        user_id: { type: "int", notNull: true, references: "users" },
        content: { type: "text", notNull: true },
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") }
    });
}
async function down(pgm) {
    pgm.dropTable("task_comments");
}
