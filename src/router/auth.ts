import { Router } from 'express'
import auth from '../controller/auth'
import { validateRequest } from '../middleware/validateRequest'
import { loginSchema, registerSchema } from '../validations/authValidations'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// register
router.post('/register', validateRequest(registerSchema), auth.register)

// login
router.post('/login', validateRequest(loginSchema), auth.login)

// logout
router.post('/logout', auth.logout)

// get current user
router.get('/me', authenticateToken, auth.getCurrentUser)

export default router 