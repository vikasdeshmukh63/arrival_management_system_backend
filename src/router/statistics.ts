import { Router } from 'express'
import statistics from '../controller/statistics'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// get arrival statistics
router.get('/arrivals', authenticateToken, statistics.getArrivalStats)

// get entity counts
router.get('/entities', authenticateToken, statistics.getEntityCounts)

export default router 