import app from './app'
import config from './config/config'
import db from './models/index'
import { logger } from './utils/logger'

// server
const server = app.listen(config.PORT, () => {
    logger.success(`Server is running on port ${config.PORT}`)
})

void (async () => {
    try {
        // authenticate database connection
        await db.sequelize.authenticate()
        logger.info('Database connection established successfully')

        // synchronize database
        await db.sequelize.sync({ 
            logging: (sql: string) => logger.debug(sql),
        })
        logger.success('Database synchronized successfully')
    } catch (error) {
        logger.error('Unable to connect to the database:', error)

        // closing the server and handling error if there is any
        server.close((error) => {
            if (error) {
                logger.error(`APPLICATION ERROR`, error)
            }

            process.exit(1)
        })
    }
})()
