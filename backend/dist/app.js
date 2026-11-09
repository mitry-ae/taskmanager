"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_crypto_1 = require("node:crypto");
const logger_1 = __importDefault(require("./logger"));
const users_router_1 = __importDefault(require("./modules/users/users.router"));
const auth_router_1 = __importDefault(require("./modules/auth/auth.router"));
const error_middleware_1 = require("./middlewares/error.middleware");
const errors_1 = require("./common/errors");
const tasks_router_1 = __importDefault(require("./modules/tasks/tasks.router"));
const tags_router_1 = __importDefault(require("./modules/tags/tags.router"));
const debug_router_1 = __importDefault(require("./modules/debug/debug.router"));
const metrics_1 = require("./metrics");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// healthcheck (каждые 10с) и скрейп Prometheus забили бы логи шумом
const SILENT_PATHS = new Set(['/health', '/metrics']);
app.use((req, res, next) => {
    const requestId = (0, node_crypto_1.randomUUID)();
    const start = process.hrtime.bigint();
    res.setHeader('X-Request-Id', requestId);
    res.locals.requestId = requestId;
    res.on('finish', () => {
        if (SILENT_PATHS.has(req.path))
            return;
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        logger_1.default[level]({
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100
        }, 'request completed');
    });
    next();
});
app.use((req, res, next) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
        const labels = { method: req.method, route, status_code: String(res.statusCode) };
        metrics_1.httpRequestsTotal.inc(labels);
        metrics_1.httpRequestDuration.observe(labels, durationSeconds);
    });
    next();
});
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok ok' });
});
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics_1.register.contentType);
    res.send(await metrics_1.register.metrics());
});
app.use('/users', users_router_1.default);
app.use('/auth', auth_router_1.default);
app.use('/tasks', tasks_router_1.default);
app.use('/tags', tags_router_1.default);
// Маршруты для нагрузочных тестов не должны попадать в прод
if (process.env.NODE_ENV !== 'production') {
    app.use('/debug', debug_router_1.default);
}
app.use((req, res, next) => {
    next(new errors_1.NotFoundError("Page not found"));
});
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
