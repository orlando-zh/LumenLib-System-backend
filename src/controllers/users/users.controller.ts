import { Request, Response } from 'express';
import { UsersService } from '@services/users/users.service';

const usersService = new UsersService();

export class UsersController {
    async getAll(_req: Request, res: Response) {
        try {
            const users = await usersService.getAllUsers();
            res.json(users);
        } catch (err) {
            console.error('Error en UsersController.getAll:', err);
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
    }
}
