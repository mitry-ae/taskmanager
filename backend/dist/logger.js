"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
// Читаем env напрямую, а не из config: config падает без обязательных переменных, а логгер нужен и в тестах
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL ?? 'info',
    // В Loki удобнее фильтровать по level="error", чем по числу 50
    formatters: {
        level: (label) => ({ level: label })
    },
    base: { service: 'app' }
});
exports.default = logger;
