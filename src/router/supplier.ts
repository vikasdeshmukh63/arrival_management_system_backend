import express from 'express'
import supplier from '../controller/supplier';
import { validateRequest } from '../middleware/validateRequest';
import { createSupplierSchema, updateSupplierSchema } from '../validations/supplierValidations';

const router = express.Router();

// get all suppliers
router.get('/get-all', supplier.getAllSuppliers);

// create supplier
router.post('/create',validateRequest(createSupplierSchema), supplier.createSupplier);

// delete many suppliers
router.delete('/delete-many', supplier.deleteManySuppliers);

// update supplier
router.put('/:id',validateRequest(updateSupplierSchema), supplier.updateSupplier);

// delete single supplier
router.delete('/:id', supplier.deleteSupplier);

export default router
