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

    async create(req: Request, res: Response) {
        try {
            const { NombreCompleto, Email, Password, Rol } = req.body;

            // Validaciones mínimas
            if (!NombreCompleto || !Email || !Password) {
                return res.status(400).json({
                    message: 'NombreCompleto, Email y Password son obligatorios'
                });
            }

            const newUser = await usersService.createUser({
                NombreCompleto,
                Email,
                Password,
                Rol
            });

            res.status(201).json(newUser);

        } catch (err: any) {
            console.error('Error en UsersController.create:', err);

            res.status(500).json({
                message: err.message || 'Error al crear el usuario'
            });
        }
    }
}
