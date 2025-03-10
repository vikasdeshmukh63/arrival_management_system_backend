import express from 'express';
import size from '../controller/size';

const router = express.Router()

// get all sizes
router.get('/get-all', size.getAllSizes);

// create size
router.post('/create', size.createSize);

// delete many sizes
router.delete('/delete-many', size.deleteManySizes);

// update size
router.put('/:id', size.updateSize);

// delete single size
router.delete('/:id', size.deleteSize);

export default router
