import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { upload } from '../config/multer.config.js';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);
router.post('/:id/documents', upload.single('document'), userController.uploadDocument);

export default router;
