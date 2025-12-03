import { Request, Response } from 'express';
import { UsersService } from '@services/users/users.service';

export class UsersController {
    private usersService = new UsersService();

    async getAll(req: Request, res: Response) {
        try {
            const users = await this.usersService.getAllUsers();

            const safeUsers = users.map(({ PasswordHash, ...u }) => u);

            res.json(safeUsers);
        } catch (error) {
            console.error('Error en UsersController.getAll:', error);
            res.status(500).json({ message: 'Error al obtener usuarios' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newUser = await this.usersService.createUser(req.body);
            const { PasswordHash, ...safeUser } = newUser;

            res.status(201).json(safeUser);
        } catch (error: any) {
            console.error('Error en UsersController.create:', error);

            if (error.message.includes('obligatorios')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: error.message });
            }

            res.status(500).json({ message: 'Error interno al crear usuario' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        try {
            const updatedUser = await this.usersService.updateUser(Number(id), updateData);
            const { PasswordHash, ...safeUser } = updatedUser;

            res.json({
                message: 'Usuario actualizado correctamente',
                user: safeUser
            });

        } catch (error: any) {
            console.error('Error en UsersController.update:', error);

            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({ message: error.message });
            }

            res.status(500).json({ message: 'Error interno al actualizar usuario' });
        }
    }
}