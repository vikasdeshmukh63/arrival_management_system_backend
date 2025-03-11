import { Router } from 'express';
import arrival from '../controller/arrival';
import { createArrivalSchema, updateArrivalSchema, startProcessingSchema, scanArrivalSchema } from '../validations/arrivalValidations';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Get all upcoming arrivals
router.get('/get-all', arrival.getAllArrivals);

// Create a new arrival
router.post('/create', validateRequest(createArrivalSchema), arrival.createArrival);

// delete many arrivals
router.delete('/delete-many', arrival.deleteMultipleArrival);

// Get a single arrival by ID
router.get('/:arrivalId', arrival.getArrivalByArrivalId);

// Update an arrival (only for upcoming/not started arrivals)
router.put('/:arrivalId', validateRequest(updateArrivalSchema), arrival.updateArrival);

// delete single arrival
router.delete('/:arrivalId', arrival.deleteArrival);

// Start processing an arrival
router.post('/start-processing/:arrivalId', validateRequest(startProcessingSchema), arrival.startProcessing);

// Scan an arrival
router.post('/scan/:arrivalId', validateRequest(scanArrivalSchema), arrival.scanArrival);

// Finish processing an arrival
router.post('/finish-processing/:arrivalId', arrival.finishProcessing);

export default router;