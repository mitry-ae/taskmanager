"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.createTable("deploy_test_log", {
        id: "id",
        created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") }
    });
}
async function down(pgm) {
    pgm.dropTable("deploy_test_log");
}
