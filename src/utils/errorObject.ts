import { Request } from 'express'
import config from '../config/config'
import { EApplicationEnvironment } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import { THttpError } from '../types/types'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (err: Error | unknown, req: Request, errStatusCode: number = 500, validationErrors?: unknown): THttpError => {
    const errorObj: THttpError = {
        success: false,
        statusCode: errStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
        data: validationErrors || null,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    //log the error
    console.error(`CONTROLLER_ERROR`, {
        meta: errorObj
    })

    // If the environment is production, we don't want to expose the IP address of the user
    if (config.ENV === EApplicationEnvironment.PRODUCTION) {
        delete errorObj.request.ip
        delete errorObj.trace
    }

    return errorObj
}
