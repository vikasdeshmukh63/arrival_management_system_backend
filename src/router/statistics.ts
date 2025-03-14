import { Router } from 'express'
import statistics from '../controller/statistics'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Get arrival statistics
router.get('/arrivals', authenticateToken, statistics.getArrivalStats)

// Get entity counts
router.get('/entities', authenticateToken, statistics.getEntityCounts)

export default router 