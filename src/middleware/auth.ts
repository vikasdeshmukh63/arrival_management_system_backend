import { NextFunction, Request, Response } from 'express'
import { verify as jwtVerify, Secret } from 'jsonwebtoken'
import config from '../config/config'
import { EUserRole } from '../constants/application'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'

if (!config.JWT_SECRET) {
    throw new Error('JWT secret is required')
}

export interface AuthRequest extends Request {
    user?: {
        user_id: number
        email: string
        role: EUserRole
    }
}

interface TokenPayload {
    user_id: number;
    email: string;
    role: EUserRole;
}

function isTokenPayload(payload: unknown): payload is TokenPayload {
    return (
        typeof payload === 'object' &&
        payload !== null &&
        'user_id' in payload &&
        'email' in payload &&
        'role' in payload
    )
}

type Verify = (token: string, secret: Secret) => object;

export const authenticateToken = (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            throw new Error('Authentication token is required')
        }

        const verifyResult = (jwtVerify as Verify)(token, config.JWT_SECRET as Secret)
        
        if (!isTokenPayload(verifyResult)) {
            throw new Error('Invalid token payload')
        }
        
        req.user = verifyResult
        next()
    } catch (err) {
        const errorMessage = err instanceof Error ? 'Invalid token' : responseMessage.SOMETHING_WENT_WRONG
        return httpError(next, new Error(errorMessage), req, 401)
    }
}

export const requireAdmin = (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== EUserRole.ADMIN) {
            throw new Error('Admin access required')
        }
        next()
    } catch (error) {
        const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
        return httpError(next, err, req, 403)
    }
} 