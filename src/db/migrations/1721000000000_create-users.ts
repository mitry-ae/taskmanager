import { MigrationBuilder } from "node-pg-migrate";

export const up = async (pgm: MigrationBuilder) => {
  pgm.createTable("users", {
    id: "id",
    email: { type: "varchar(255)", notNull: true, unique: true },
    password_hash: { type: "varchar(255)", notNull: true },
    created_at: { type: "timestamp", notNull: true, default: pgm.func("now()") },
  });
};

export const down = async (pgm: MigrationBuilder) => {
  pgm.dropTable("users");
};