import { MigrationBuilder } from "node-pg-migrate";

export const up = (pgm: MigrationBuilder) => {
    pgm.createType('task_status', ['todo', 'in_progress', 'done'])
    pgm.createType("task_priority", ['low', 'medium', 'high'])

    pgm.createTable("tasks",
        {
            id: "id",
            user_id: {type: "int", notNull: true, references: "users", onDelete:"CASCADE"},
            title: {type: "varchar(255)", notNull: true},
            description: {type: "text", notNull: false},
            status: {type: "task_status", notNull: true, default: 'todo'},
            priority: {type: "task_priority", notNull: true, default: 'low'},
            due_date: {type: "timestamptz", notNull: false},
            created_at: {type: "timestamptz", notNull: true, default: pgm.func("now()")},
        }
    )
}


export const down = (pgm: MigrationBuilder) => {
    pgm.dropTable("tasks");
    pgm.dropType("task_status");
    pgm.dropType("task_priority");
};
