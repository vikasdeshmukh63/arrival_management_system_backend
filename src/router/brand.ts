import express from 'express';
import brand from '../controller/brand';

const router = express.Router()

// get all brands
router.get('/get-all',brand.getAllBrands);

// create brand
router.post('/create', brand.createBrand);

// delete many brands
router.delete('/delete-many', brand.deleteManyBrands);

// update brand
router.put('/:id', brand.updateBrand);

// delete single brand
router.delete('/:id', brand.deleteBrand);

export default router
