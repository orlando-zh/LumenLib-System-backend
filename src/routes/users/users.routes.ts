import { Router } from 'express';
import { UsersController } from '../../controllers/users/users.controller';
import { isAdmin, isStaff } from '@middlewares/auth/admin.middleware';

const router = Router();
const usersController = new UsersController();

// Obtener todos
router.get('/', usersController.getAll.bind(usersController));

// Crear usuario (Solo Admin)
router.post('/', isAdmin, usersController.create.bind(usersController));

// Actualizar usuario (Admin o Bibliotecario)
// Se usa PUT y se pasa el ID en la URL
router.put('/:id', isStaff, usersController.update.bind(usersController));

export default router;