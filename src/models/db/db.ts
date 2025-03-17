import { Sequelize } from 'sequelize'
import config from '../../config/config'

// if database password is not provided, throw an error
if (!config.DB_PASSWORD) {
    throw new Error('Database password is required')
}

// create sequelize instance
const sequelize = new Sequelize({
    dialect: 'postgres',
    host: config.DB_HOST,
    port: parseInt(config.DB_PORT || '5432'),
    username: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    logging: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: true
        }
    }
})

export default sequelize
