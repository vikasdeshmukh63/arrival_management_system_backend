import express from 'express'
import condition from '../controller/condition'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = express.Router()

// get all conditions
router.get('/get-all', authenticateToken, condition.getAllConditions)

// create condition
router.post('/create', authenticateToken, requireAdmin, condition.createCondition)

// delete many conditions
router.delete('/delete-many', authenticateToken, requireAdmin, condition.deleteManyConditions)

// update condition
router.put('/:id', authenticateToken, condition.updateCondition)

// delete single condition
router.delete('/:id', authenticateToken, requireAdmin, condition.deleteCondition)

export default router

