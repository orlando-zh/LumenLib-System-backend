import { Router } from 'express';
import { UsersController } from '../../controllers/users/users.controller';
import { isAdmin, isStaff } from '@middlewares/auth/admin.middleware';

const router = Router();
const usersController = new UsersController();



// RUTAS DE GESTIÓN DE USUARIOS

// 1. OBTENER TODOS / BUSCAR POR NOMBRE (GET /users o GET /users?nombre=...)
// Restringido a Admin para ver la lista completa.
router.get('/', isStaff, usersController.getAll.bind(usersController));

// 2. OBTENER POR ID (GET /users/:id)
// Restringido a Staff/Admin para ver detalles de cualquier usuario.
router.get('/:id', isStaff, usersController.getById.bind(usersController));

// 3. CREAR USUARIO (POST /users)
// Restringido a Admin.
router.post('/', isAdmin, usersController.create.bind(usersController));

// 4. ACTUALIZAR USUARIO (PUT /users/:id)
// Restringido a Staff/Admin.
router.put('/:id', isStaff, usersController.update.bind(usersController));

// 5. ELIMINAR USUARIO (DELETE /users/:id)
// Restringido solo a Admin (Operación crítica).
router.delete('/:id', isAdmin, usersController.delete.bind(usersController));

export default router;