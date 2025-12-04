import { Router } from 'express';
import { TaskController } from './task.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', TaskController.create);
router.get('/', TaskController.getAll);
router.get('/:id', TaskController.getOne);
router.patch('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);
router.patch('/:id/toggle', TaskController.toggle);

export default router;
