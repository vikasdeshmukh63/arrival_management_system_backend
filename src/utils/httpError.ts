import { NextFunction, Request } from 'express'
import errorObject from './errorObject'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (nextFunc: NextFunction, err: Error | unknown, req: Request, errorStatusCode: number = 500, validationErrors?: unknown): void => {
    const errorObj = errorObject(err, req, errorStatusCode, validationErrors)
    return nextFunc(errorObj)
}
