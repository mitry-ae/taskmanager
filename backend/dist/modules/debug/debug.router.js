"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Только для нагрузочных тестов и проверки алертов. В app.ts подключается не в production.
const router = (0, express_1.Router)();
const MAX_DELAY_MS = 10_000;
// GET /debug/slow?ms=800 — отвечает 200 через ms миллисекунд
router.get('/slow', async (req, res) => {
    const ms = Math.min(Math.max(Number(req.query.ms) || 0, 0), MAX_DELAY_MS);
    await new Promise((resolve) => setTimeout(resolve, ms));
    res.status(200).json({ status: 'ok', delayedMs: ms });
});
// GET /debug/error — необработанная ошибка, уходит в errorMiddleware и отвечает 500
router.get('/error', () => {
    throw new Error('debug error');
});
exports.default = router;
