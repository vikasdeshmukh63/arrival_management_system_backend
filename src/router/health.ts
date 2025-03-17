import { Router } from 'express'
import apiController from '../controller/health'

const router = Router()

// self
router.route('/self').get(apiController.self)

// health
router.route('/health').get(apiController.health)

export default router
