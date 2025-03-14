import express from 'express'
import product from '../controller/product'
import { validateRequest } from '../middleware/validateRequest'
import { createProductSchema, updateProductSchema } from '../validations/productValidation'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all products
router.get('/get-all', authenticateToken, product.getAllProducts)

// create product
router.post('/create', authenticateToken, requireAdmin, validateRequest(createProductSchema), product.createProduct)

// delete many products
router.delete('/delete-many', authenticateToken, requireAdmin, product.deleteManyProducts)

// update product
router.put('/:tsku', authenticateToken, validateRequest(updateProductSchema), product.updateProduct)

// delete single product
router.delete('/:tsku', authenticateToken, requireAdmin, product.deleteProduct)

// get products with discrepancy and without discrepancy
router.get('/products-with-discrepancy/:arrivalId', authenticateToken, product.getProductsWithDiscrepancyAndWithoutDiscrepancy)

export default router
