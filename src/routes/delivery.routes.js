import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();
const deliveryController = new DeliveryController();

router.get('/', deliveryController.getAll);
router.get('/:id', deliveryController.getById);
router.post('/', deliveryController.create);
router.patch('/:id/status', deliveryController.updateStatus);
router.post('/:id/receipt', upload.single('receipt'), deliveryController.uploadReceipt);

export default router;
