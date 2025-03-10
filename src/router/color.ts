import express from 'express';
import color from '../controller/color';

const router = express.Router()

// get all colors
router.get('/get-all', color.getAllColors);

// create color
router.post('/create', color.createColor);

// delete many colors
router.delete('/delete-many', color.deleteManyColors);

// update color
router.put('/:id', color.updateColor);

// delete single color
router.delete('/:id', color.deleteColor);

export default router
