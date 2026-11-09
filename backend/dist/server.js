"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const pool_1 = __importDefault(require("./db/pool"));
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./logger"));
async function main() {
    try {
        await pool_1.default.query('SELECT 1');
        logger_1.default.info('DB connected');
        const server = app_1.default.listen(config_1.default.PORT, () => logger_1.default.info({ port: config_1.default.PORT }, 'server started'));
        server.on('error', (err) => {
            logger_1.default.fatal({ err }, 'server failed to start');
            process.exit(1);
        });
    }
    catch (err) {
        logger_1.default.fatal({ err }, 'failed to connect to DB');
        process.exit(1);
    }
}
main();
