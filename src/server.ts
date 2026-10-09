import config from './config'
import pool from './db/pool'
import app from './app'
import logger from './logger'

async function main() {
    try {
        await pool.query('SELECT 1')
        logger.info('DB connected')

        const server = app.listen(config.PORT, () => logger.info({ port: config.PORT }, 'server started'))
        server.on('error', (err) => {
            logger.fatal({ err }, 'server failed to start')
            process.exit(1)
        })
    } catch (err) {
        logger.fatal({ err }, 'failed to connect to DB')
        process.exit(1)
    }
}

main()
