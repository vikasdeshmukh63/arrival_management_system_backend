import cors from 'cors'
import express, { Application, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import responseMessage from './constants/responseMessage'
import httpError from './utils/httpError'
import globalErrorHandler from './middleware/globalErrorHandler'
import router from './router'

const app: Application = express()

app.use(helmet())

app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        origin: '*', // Replace with your frontend URL
        credentials: true
    })
)

app.use(express.json())
app.use(cookieParser())

// Routes
app.use(router)

// 404 handler
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'))
    } catch (err) {
        httpError(next, err, req, 404)
    }
})

app.use(globalErrorHandler)

export default app
