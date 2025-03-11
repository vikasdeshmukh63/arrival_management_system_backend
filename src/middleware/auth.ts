import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import { EUserRole } from '../constants/application'

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

export const authenticateToken = (req: AuthRequest, _: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            throw new Error('Authentication token is required')
        }

        jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
            if (err) {
                throw new Error('Invalid token')
            }

            req.user = decoded as { user_id: number; email: string; role: EUserRole }
            next()
        })
    } catch (error) {
        const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
        return httpError(next, err, req, 401)
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