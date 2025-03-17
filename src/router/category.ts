import express from 'express'
import category from '../controller/category'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all categories
router.get('/get-all', authenticateToken, category.getAllCategories)

// create category
router.post('/create', authenticateToken, requireAdmin, category.createCategory)

// delete many categories
router.delete('/delete-many', authenticateToken, requireAdmin, category.deleteManyCategories)

// update category
router.put('/:id', authenticateToken, category.updateCategory)

// delete single category
router.delete('/:id', authenticateToken, requireAdmin, category.deleteCategory)

export default router
