import { Router } from 'express'
import auth from '../controller/auth'
import { validateRequest } from '../middleware/validateRequest'
import { loginSchema, registerSchema } from '../validations/authValidations'

const router = Router()

router.post('/register', validateRequest(registerSchema), auth.register)
router.post('/login', validateRequest(loginSchema), auth.login)

export default router 