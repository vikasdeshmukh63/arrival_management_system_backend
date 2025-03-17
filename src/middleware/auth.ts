import { NextFunction, Request, Response } from 'express'
import { verify as jwtVerify, Secret } from 'jsonwebtoken'
import config from '../config/config'
import { EUserRole } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'

// if JWT secret is not provided, throw an error
if (!config.JWT_SECRET) {
    throw new Error('JWT secret is required')
}

// auth request interface
export interface AuthRequest extends Request {
    user?: {
        user_id: number
        email: string
        role: EUserRole
    }
    cookies: {
        token?: string
    }
}

// token payload interface
interface TokenPayload {
    user_id: number;
    email: string;
    role: EUserRole;
}

// check if payload is token payload
function isTokenPayload(payload: unknown): payload is TokenPayload {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'user_id' in payload &&
        'email' in payload &&
        'role' in payload
    )
}

// verify function type
type Verify = (token: string, secret: Secret) => object;

// authenticate token middleware
export const authenticateToken = (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        // getting token from cookies
        const token = req.cookies.token;

        // if token is not provided, throw an error
        if (!token) {
            throw new Error('Authentication token is required')
        }

        // verify token
        const verifyResult = (jwtVerify as Verify)(token, config.JWT_SECRET as Secret)

        // if payload is not token payload, throw an error
        if (!isTokenPayload(verifyResult)) {
            throw new Error('Invalid token payload')
        }
        
        // set user in request
        req.user = verifyResult

        // call next middleware
        next()
    } catch (err) {
        // if error is instance of error, use error message, otherwise use something went wrong message
        const errorMessage = err instanceof Error ? 'Invalid token' : responseMessage.SOMETHING_WENT_WRONG

        // return error
        return httpError(next, new Error(errorMessage), req, 401)
    }
}

// require admin middleware
export const requireAdmin = (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        // if user role is not admin, throw an error
        if (req.user?.role !== EUserRole.ADMIN) {
            throw new Error('Admin access required')
        }

        // call next middleware
        next()
    } catch (error) {
        // if error is instance of error, use error message, otherwise use something went wrong message
        const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)

        // return error
        return httpError(next, err, req, 403)
    }
} 