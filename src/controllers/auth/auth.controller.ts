import { Request, Response } from 'express';
import { UsersRepository } from '@repositories/users/users.repository';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { EnvConfig } from '@config/app.config';

const usersRepo = new UsersRepository();

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password son requeridos' });
        }

        try {
            const usuarios = await usersRepo.getAll();
            const user = usuarios.find(u => u.Email === email);

            if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' });

            const validPassword = await bcrypt.compare(password, user.PasswordHash!);
            if (!validPassword) return res.status(401).json({ message: 'Credenciales incorrectas' });

            // ⚠️ Tipos correctos para JWT
            const payload = { id: user.UsuarioID, email: user.Email, rol: user.Rol };
            const secret: Secret = EnvConfig.JWT_SECRET;  // string -> Secret
            const options: SignOptions = { expiresIn: Number(EnvConfig.JWT_EXPIRES_IN.replace('s','')) || 3600 };

            const token = jwt.sign(payload, secret, options);

            return res.json({ token });

        } catch (err) {
            console.error('Error en AuthController.login:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}
