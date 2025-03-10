import express from 'express';
import category from '../controller/category';

const router = express.Router()

// get all categories
router.get('/get-all', category.getAllCategories);

// create category
router.post('/create', category.createCategory);

// delete many categories
router.delete('/delete-many', category.deleteManyCategories);

// update category
router.put('/:id', category.updateCategory);

// delete single category
router.delete('/:id', category.deleteCategory);

export default router
