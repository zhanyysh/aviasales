import { Router } from 'express';
import { getAllAirlines, addAirline, deactivateAirline, deleteAirline, assignManager, activateAirline, getAirlineById } from '../controllers/airlineController';

const router = Router();

router.get('/', getAllAirlines);
router.post('/', addAirline);
router.get('/:id', getAirlineById);
router.post('/:id/deactivate', deactivateAirline);
router.post('/:id/activate', activateAirline);
router.delete('/:id', deleteAirline);
router.post('/:id/assign-manager', assignManager);

export default router;
