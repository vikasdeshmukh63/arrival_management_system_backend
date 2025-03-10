import express from 'express';
import condition from '../controller/condition';

const router = express.Router()

// get all conditions
router.get('/get-all', condition.getAllConditions);

// create condition
router.post('/create', condition.createCondition);

// delete many conditions
router.delete('/delete-many', condition.deleteManyConditions);

// update condition
router.put('/:id', condition.updateCondition);

// delete single condition
router.delete('/:id', condition.deleteCondition);

export default router
