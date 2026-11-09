import { type ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("tags", {
        id: "id",
        user_id: { type: "int", notNull: true, references: "users", onDelete: 'CASCADE' },
        name: { type: "varchar(255)", notNull: true }
    }, {
        constraints: {
            unique: ['user_id', 'name']
        }
    })

    pgm.createTable("task_tags", {
        task_id: { type: "int", notNull: true, onDelete: "CASCADE", references: "tasks", primaryKey: true },
        tag_id: { type: "int", notNull: true, onDelete: "CASCADE", references: "tags", primaryKey: true }
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> { 
    pgm.dropTable("tags")
    pgm.dropTable("task_tags")
}
