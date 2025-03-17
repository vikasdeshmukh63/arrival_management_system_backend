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
import { AuthRequest } from '../middleware/auth'

// get jwt secret
const jwtSecret: Secret = config.JWT_SECRET || ''

// if jwt secret is not set
if (!config.JWT_SECRET) {
    throw new Error('JWT secret is required')
}

// jwt payload
type JWTPayload = {
    user_id: number
    email: string
    role: string
}

// sign jwt
const signJWT = (payload: JWTPayload): string => {
    return (sign as (payload: JWTPayload, secret: Secret, options: SignOptions) => string)(payload, jwtSecret, { expiresIn: '24h' })
}

// set cookie token
const setCookieToken = (res: Response, token: string) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
}

export default {
    // ! register
    register: async (req: Request<Record<string, never>, unknown, RegisterRequest>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { name, email, password, role = EUserRole.ADMIN } = req.body

            // check if user already exists
            const existingUser = (await database.User.findOne({ where: { email } })) as IUser | null
            if (existingUser) {
                throw new Error(responseMessage.ALREADY_EXIST('User with this email'))
            }

            // create new user
            const user = (await database.User.create({
                name,
                email,
                password,
                role
            })) as IUser

            // generate jwt token and set cookie
            const payload: JWTPayload = { user_id: user.user_id, email: user.email, role: user.role }
            const token = signJWT(payload)
            setCookieToken(res, token)

            return httpResponse(req, res, 201, responseMessage.CREATED, {
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        } catch (error) {
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 400)
        }
    },

    // ! login
    login: async (req: Request<Record<string, never>, unknown, LoginRequest>, res: Response, next: NextFunction) => {
        try {
            // get body
            const { email, password } = req.body

            // find user
            const user = (await database.User.findOne({ where: { email } })) as IUser | null
            if (!user) {
                throw new Error(responseMessage.NOT_FOUND('User'))
            }

            // verify password
            const isPasswordValid = await bcrypt.compare(password, user.password)
            if (!isPasswordValid) {
                throw new Error('Invalid credentials')
            }

            // generate jwt token and set cookie
            const payload: JWTPayload = { user_id: user.user_id, email: user.email, role: user.role }
            const token = signJWT(payload)
            setCookieToken(res, token)

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 401)
        }
    },

    // ! logout
    logout: (req: Request, res: Response) => {
        res.clearCookie('token')
        return httpResponse(req, res, 200, responseMessage.SUCCESS, { message: 'Logged out successfully' })
    },

    // ! get current user
    getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            // get auth request
            const authReq = req as AuthRequest

            // if user is not authenticated
            if (!authReq.user) {
                throw new Error('User not authenticated')
            }

            // find user
            const user = await database.User.findOne({
                where: { user_id: authReq.user.user_id },
                attributes: ['user_id', 'name', 'email', 'role']
            })

            // if user not found
            if (!user) {
                throw new Error(responseMessage.NOT_FOUND('User'))
            }

            // return response
            return httpResponse(req, res, 200, responseMessage.SUCCESS, { user })
        } catch (error) {
            // return error
            const err = error instanceof Error ? error : new Error(responseMessage.SOMETHING_WENT_WRONG)
            return httpError(next, err, req, 401)
        }
    }
}
