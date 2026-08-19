import config from './config'
import pool from './db/pool'
import app from './app'

async function main() {
    try {
        await pool.query('SELECT 1')
        console.log('DB connected')
        
        const server = app.listen(config.PORT, () => console.log(`SERVER started on PORT: ${config.PORT}`))
        server.on('error', (err) => {
            console.error('Server failed to start', err)
            process.exit(1)
        })
    } catch (err) {
        console.error('Failed to connect to DB', err)
        process.exit(1)
    }
}

main()