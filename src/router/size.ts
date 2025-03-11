import express from 'express'
import size from '../controller/size'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all sizes
router.get('/get-all', authenticateToken, size.getAllSizes)

// create size
router.post('/create', authenticateToken, requireAdmin, size.createSize)

// delete many sizes
router.delete('/delete-many', authenticateToken, requireAdmin, size.deleteManySizes)

// update size
router.put('/:id', authenticateToken, size.updateSize)

// delete single size
router.delete('/:id', authenticateToken, requireAdmin, size.deleteSize)

export default router

