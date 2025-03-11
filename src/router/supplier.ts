import express from 'express'
import supplier from '../controller/supplier'
import { validateRequest } from '../middleware/validateRequest'
import { createSupplierSchema, updateSupplierSchema } from '../validations/supplierValidations'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all suppliers
router.get('/get-all', authenticateToken, supplier.getAllSuppliers)

// create supplier
router.post('/create', authenticateToken, requireAdmin, validateRequest(createSupplierSchema), supplier.createSupplier)

// delete many suppliers
router.delete('/delete-many', authenticateToken, requireAdmin, supplier.deleteManySuppliers)

// update supplier
router.put('/:id', authenticateToken, validateRequest(updateSupplierSchema), supplier.updateSupplier)

// delete single supplier
router.delete('/:id', authenticateToken, requireAdmin, supplier.deleteSupplier)

export default router
