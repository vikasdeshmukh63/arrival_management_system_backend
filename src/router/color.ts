import express from 'express'
import color from '../controller/color'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all colors
router.get('/get-all', authenticateToken, color.getAllColors)

// create color
router.post('/create', authenticateToken, requireAdmin, color.createColor)

// delete many colors
router.delete('/delete-many', authenticateToken, requireAdmin, color.deleteManyColors)

// update color
router.put('/:id', authenticateToken, color.updateColor)

// delete single color
router.delete('/:id', authenticateToken, requireAdmin, color.deleteColor)

export default router
