import dotenvFlow from 'dotenv-flow'

// Load environment variables from .env.development or .env.production
dotenvFlow.config({
    node_env: process.env.NODE_ENV || 'development'
})

export default {
    // general
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,

    // database
    DATABASE: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,

    // jwt
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key'
}
