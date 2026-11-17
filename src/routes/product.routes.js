import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/:id/shipping-cost', productController.getShippingCost);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
