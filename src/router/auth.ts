import { Router } from 'express'
import auth from '../controller/auth'
import { validateRequest } from '../middleware/validateRequest'
import { loginSchema, registerSchema } from '../validations/authValidations'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/register', validateRequest(registerSchema), auth.register)
router.post('/login', validateRequest(loginSchema), auth.login)
router.post('/logout', auth.logout)
router.get('/me', authenticateToken, auth.getCurrentUser)

export default router 