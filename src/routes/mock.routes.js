import { Router } from 'express';
import { MockController } from '../controllers/mock.controller.js';

const router = Router();
const mockController = new MockController();

router.get('/users', mockController.getUsers);
router.get('/drivers', mockController.getDrivers);
router.get('/orders', mockController.getOrders);
router.get('/deliveries', mockController.getDeliveries);
router.post('/seed', mockController.seed);

export default router;
