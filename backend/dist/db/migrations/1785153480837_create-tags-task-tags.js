"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.createTable("tags", {
        id: "id",
        user_id: { type: "int", notNull: true, references: "users", onDelete: 'CASCADE' },
        name: { type: "varchar(255)", notNull: true }
    }, {
        constraints: {
            unique: ['user_id', 'name']
        }
    });
    pgm.createTable("task_tags", {
        task_id: { type: "int", notNull: true, onDelete: "CASCADE", references: "tasks", primaryKey: true },
        tag_id: { type: "int", notNull: true, onDelete: "CASCADE", references: "tags", primaryKey: true }
    });
}
async function down(pgm) {
    pgm.dropTable("tags");
    pgm.dropTable("task_tags");
}
