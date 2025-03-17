import { Router } from 'express'
import arrival from '../controller/arrival'
import { createArrivalSchema, updateArrivalSchema, startProcessingSchema, scanArrivalSchema } from '../validations/arrivalValidations'
import { validateRequest } from '../middleware/validateRequest'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// get all upcoming arrivals
router.get('/get-all', authenticateToken, arrival.getAllArrivals)

// create a new arrival
router.post('/create', authenticateToken, requireAdmin, validateRequest(createArrivalSchema), arrival.createArrival)

// delete many arrivals
router.delete('/delete-many', authenticateToken, requireAdmin, arrival.deleteMultipleArrival)

// get a single arrival by id
router.get('/:arrivalId', authenticateToken, arrival.getArrivalByArrivalId)

// update an arrival (only for upcoming/not started arrivals)
router.put('/:arrivalId', authenticateToken, validateRequest(updateArrivalSchema), arrival.updateArrival)

// delete single arrival
router.delete('/:arrivalId', authenticateToken, requireAdmin, arrival.deleteArrival)

// start processing an arrival
router.post('/start-processing/:arrivalId', authenticateToken, validateRequest(startProcessingSchema), arrival.startProcessing)

// scan an arrival
router.post('/scan/:arrivalId', authenticateToken, validateRequest(scanArrivalSchema), arrival.scanArrival)

// finish processing an arrival
router.post('/finish-processing/:arrivalId', authenticateToken, arrival.finishProcessing)

// add products to arrival
router.post('/add-products/:arrivalId', authenticateToken, requireAdmin, arrival.addProductsToArrival)

export default router

