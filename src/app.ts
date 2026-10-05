
import express from 'express'
import UserRouter from './modules/users/users.router'
import AuthRouter from './modules/auth/auth.router'
import { type Request, type Response, type NextFunction } from "express";
import { errorMiddleware } from './middlewares/error.middleware';
import { NotFoundError } from './common/errors';
import TasksRouter from './modules/tasks/tasks.router'
import TagsRouter from './modules/tags/tags.router'
import { register, httpRequestsTotal, httpRequestDuration } from './metrics'


const app = express()

app.use(express.json())
app.use((req: Request, res: Response, next: NextFunction) => {
    const now = new Date()
    console.log(`[${now.toLocaleDateString("ru-RU")} ${now.toLocaleTimeString('ru-RU')}:${now.getMilliseconds()}] ${req.method} ${req.url}`)
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


app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError("Page not found"))
})

app.use(errorMiddleware)

export default app