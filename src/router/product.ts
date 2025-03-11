import express from 'express'
import product from '../controller/product'
import { validateRequest } from '../middleware/validateRequest'
import { createProductSchema, updateProductSchema } from '../validations/productValidation'

const router = express.Router()

// get all products
router.get('/get-all', product.getAllProducts)

// create product
router.post('/create', validateRequest(createProductSchema), product.createProduct)

// delete many products
router.delete('/delete-many', product.deleteManyProducts)

// update product
router.put('/:barcode', validateRequest(updateProductSchema), product.updateProduct)

// delete single product
router.delete('/:barcode', product.deleteProduct)

// get products with discrepancy and without discrepancy
router.get('/products-with-discrepancy/:arrivalId', product.getProductsWithDiscrepancyAndWithoutDiscrepancy)

export default router
