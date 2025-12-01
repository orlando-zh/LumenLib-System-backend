import { Router } from 'express';
import { UsersController } from '../../controllers/users/users.controller';
import { isAdmin } from '@middlewares/auth/admin.middleware';

const router = Router();
const usersController = new UsersController();

router.get('/', usersController.getAll.bind(usersController));

// POST crear usuario (solo admin)
router.post('/', isAdmin, usersController.create.bind(usersController));

export default router;
