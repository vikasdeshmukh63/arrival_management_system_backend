import express from 'express'
import style from '../controller/style'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all styles
router.get('/get-all', authenticateToken, style.getAllStyles)

// create style
router.post('/create', authenticateToken, requireAdmin, style.createStyle)

// delete many styles
router.delete('/delete-many', authenticateToken, requireAdmin, style.deleteManyStyles)

// update style
router.put('/:id', authenticateToken, style.updateStyle)

// delete single style
router.delete('/:id', authenticateToken, requireAdmin, style.deleteStyle)

export default router
