import pino from 'pino'

// Читаем env напрямую, а не из config: config падает без обязательных переменных, а логгер нужен и в тестах
const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    // В Loki удобнее фильтровать по level="error", чем по числу 50
    formatters: {
        level: (label) => ({ level: label })
    },
    base: { service: 'app' }
})

export default logger
