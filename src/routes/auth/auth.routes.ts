// src/routes/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '@controllers/auth/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res) => authController.login(req, res));

export default router;
