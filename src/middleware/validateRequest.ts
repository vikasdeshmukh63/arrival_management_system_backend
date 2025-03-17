import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import httpError from '../utils/httpError'
import responseMessage from '../constants/responseMessage'

// validate request middleware
export const validateRequest = (schema: AnyZodObject) => {
    return async (req: Request, _: Response, next: NextFunction) => {
        try {
            // parse request body
            await schema.parseAsync(req.body)

            // call next middleware
            next()
        } catch (error) {
            // if error is instance of zod error
            if (error instanceof ZodError) {
                // get validation errors
                const validationErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))

                // return error
                return httpError(next, new Error('Validation failed'), req, 400, validationErrors)
            }

            // return error
            return httpError(next, new Error(responseMessage.SOMETHING_WENT_WRONG), req, 500)
        }
    }
}
