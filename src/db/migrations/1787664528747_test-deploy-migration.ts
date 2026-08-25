import { type ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("deploy_test_log", {
        id: "id",
        created_at: {type: "timestamptz", notNull: true, default: pgm.func("now()")}
    })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("deploy_test_log")
}
