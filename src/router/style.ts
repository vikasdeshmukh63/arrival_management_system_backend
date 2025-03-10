import express from 'express';
import style from '../controller/style';

const router = express.Router()

// get all styles
router.get('/get-all', style.getAllStyles);

// create style
router.post('/create', style.createStyle);

// delete many styles
router.delete('/delete-many', style.deleteManyStyles);

// update style
router.put('/:id', style.updateStyle);

// delete single style
router.delete('/:id', style.deleteStyle);

export default router
