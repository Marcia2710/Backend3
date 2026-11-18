import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller.js';

const router = Router();
const deliveryController = new DeliveryController();

router.get('/', deliveryController.getAll);
router.get('/:id', deliveryController.getById);
router.post('/', deliveryController.create);
router.patch('/:id/status', deliveryController.updateStatus);

export default router;
