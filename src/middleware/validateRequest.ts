import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import httpError from '../utils/httpError'
import responseMessage from '../constants/responseMessage'

export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, _: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body)
            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
                return httpError(next, new Error('Validation failed'), req, 400, validationErrors)
            }
            return httpError(next, new Error(responseMessage.SOMETHING_WENT_WRONG), req, 500)
        }
    }
}
