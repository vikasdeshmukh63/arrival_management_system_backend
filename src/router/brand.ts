import express from 'express'
import brand from '../controller/brand'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all brands
router.get('/get-all', authenticateToken, brand.getAllBrands)

// create brand
router.post('/create', authenticateToken, requireAdmin, brand.createBrand)

// delete many brands
router.delete('/delete-many', authenticateToken, requireAdmin, brand.deleteManyBrands)

// update brand
router.put('/:id', authenticateToken, brand.updateBrand)

// delete single brand
router.delete('/:id', authenticateToken, requireAdmin, brand.deleteBrand)

export default router
