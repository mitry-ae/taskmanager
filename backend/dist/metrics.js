"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestDuration = exports.httpRequestsTotal = exports.register = void 0;
const prom_client_1 = require("prom-client");
exports.register = new prom_client_1.Registry();
(0, prom_client_1.collectDefaultMetrics)({ register: exports.register });
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [exports.register],
});
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [exports.register],
});
