// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);


router.use(authenticate);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
