import { type ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("task_comments", {
        id: "id",
        task_id: {type: "int", notNull: true, references: "tasks", onDelete:"CASCADE"},
        user_id: {type: "int", notNull: true, references: "users"},
        content: {type: "text", notNull: true},
        created_at: {type: "timestamptz", notNull: true, default: pgm.func("now()")}
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("task_comments")
}
