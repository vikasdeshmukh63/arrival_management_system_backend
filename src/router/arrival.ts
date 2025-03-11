import { Router } from 'express'
import arrival from '../controller/arrival'
import { createArrivalSchema, updateArrivalSchema, startProcessingSchema, scanArrivalSchema } from '../validations/arrivalValidations'
import { validateRequest } from '../middleware/validateRequest'
import { authenticateToken, requireAdmin } from '../middleware/auth'

const router = Router()

// Get all upcoming arrivals
router.get('/get-all', authenticateToken, arrival.getAllArrivals)

// Create a new arrival
router.post('/create', authenticateToken, requireAdmin, validateRequest(createArrivalSchema), arrival.createArrival)

// delete many arrivals
router.delete('/delete-many', authenticateToken, requireAdmin, arrival.deleteMultipleArrival)

// Get a single arrival by ID
router.get('/:arrivalId', authenticateToken, arrival.getArrivalByArrivalId)

// Update an arrival (only for upcoming/not started arrivals)
router.put('/:arrivalId', authenticateToken, validateRequest(updateArrivalSchema), arrival.updateArrival)

// delete single arrival
router.delete('/:arrivalId', authenticateToken, requireAdmin, arrival.deleteArrival)

// Start processing an arrival
router.post('/start-processing/:arrivalId', authenticateToken, validateRequest(startProcessingSchema), arrival.startProcessing)

// Scan an arrival
router.post('/scan/:arrivalId', authenticateToken, validateRequest(scanArrivalSchema), arrival.scanArrival)

// Finish processing an arrival
router.post('/finish-processing/:arrivalId', authenticateToken, arrival.finishProcessing)

export default router

