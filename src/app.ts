import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import responseMessage from './constants/responseMessage'
import httpError from './utils/httpError'
import globalErrorHandler from './middleware/globalErrorHandler'
import router from './router'

// app
const app: Application = express()

// helmet
app.use(helmet())

// cors
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        origin: true,
        credentials: true,
        allowedHeaders: ['Content-Type']
    })
)

// express json
app.use(express.json())

// cookie parser
app.use(cookieParser())

// routes
app.use(router)

// 404 handler
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'))
    } catch (err) {
        httpError(next, err, req, 404)
    }
})

// global error handler
app.use(globalErrorHandler)

export default app
