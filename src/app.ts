
import express from 'express'
import { randomUUID } from 'node:crypto'
import logger from './logger'
import UserRouter from './modules/users/users.router'
import AuthRouter from './modules/auth/auth.router'
import { type Request, type Response, type NextFunction } from "express";
import { errorMiddleware } from './middlewares/error.middleware';
import { NotFoundError } from './common/errors';
import TasksRouter from './modules/tasks/tasks.router'
import TagsRouter from './modules/tags/tags.router'
import DebugRouter from './modules/debug/debug.router'
import { register, httpRequestsTotal, httpRequestDuration } from './metrics'


const app = express()

app.use(express.json())
// healthcheck (каждые 10с) и скрейп Prometheus забили бы логи шумом
const SILENT_PATHS = new Set(['/health', '/metrics'])

app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = randomUUID()
    const start = process.hrtime.bigint()
    res.setHeader('X-Request-Id', requestId)
    res.locals.requestId = requestId

    res.on('finish', () => {
        if (SILENT_PATHS.has(req.path)) return
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6
        const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
        logger[level]({
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100
        }, 'request completed')
    })
    next()
})

app.use((req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint()
    res.on('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9
        const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched'
        const labels = { method: req.method, route, status_code: String(res.statusCode) }
        httpRequestsTotal.inc(labels)
        httpRequestDuration.observe(labels, durationSeconds)
    })
    next()
})

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok ok' })
})

app.get('/metrics', async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType)
    res.send(await register.metrics())
})

app.use('/users', UserRouter)
app.use('/auth', AuthRouter)
app.use('/tasks', TasksRouter)
app.use('/tags', TagsRouter)

// Маршруты для нагрузочных тестов не должны попадать в прод
if (process.env.NODE_ENV !== 'production') {
    app.use('/debug', DebugRouter)
}


app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError("Page not found"))
})

app.use(errorMiddleware)

export default app