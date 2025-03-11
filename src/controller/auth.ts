import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { SignOptions, sign, Secret } from 'jsonwebtoken'
import database from '../models'
import responseMessage from '../constants/responseMessage'
import httpError from '../utils/httpError'
import httpResponse from '../utils/httpResponse'
import { LoginRequest, RegisterRequest } from '../validations/authValidations'
import { IUser } from '../types/types'
import config from '../config/config'
import { EUserRole } from '../constants/application'

const jwtSecret: Secret = config.JWT_SECRET || ''
if (!config.JWT_SECRET) {
    throw new Error('JWT secret is required')
}

type JWTPayload = {
    user_id: number
    email: string
    role: string
}

const signJWT = (payload: JWTPayload): string => {
    return (sign as (payload: JWTPayload, secret: Secret, options: SignOptions) => string)(payload, jwtSecret, { expiresIn: '24h' })
}

export default {
    register: async (req: Request<Record<string, never>, unknown, RegisterRequest>, res: Response, next: NextFunction) => {
        try {
            const { name, email, password, role = EUserRole.USER } = req.body

            // Check if user already exists
            const existingUser = (await database.User.findOne({ where: { email } })) as IUser | null
            if (existingUser) {
                throw new Error(responseMessage.ALREADY_EXIST('User with this email'))
            }

            // Create new user
            const user = (await database.User.create({
                name,
                email,
                password,
                role
            })) as IUser

            // Generate JWT token
            const payload: JWTPayload = { user_id: user.user_id, email: user.email, role: user.role }
            const token = signJWT(payload)

            return httpResponse(req, res, 201, responseMessage.CREATED, {
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 400)
        }
    },

    login: async (req: Request<Record<string, never>, unknown, LoginRequest>, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body

            // Find user
            const user = (await database.User.findOne({ where: { email } })) as IUser | null
            if (!user) {
                throw new Error(responseMessage.NOT_FOUND('User'))
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                throw new Error('Invalid credentials')
            }

            // Generate JWT token
            const payload: JWTPayload = { user_id: user.user_id, email: user.email, role: user.role }
            const token = signJWT(payload)

            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 401)
        }
    }
}
