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

            // Verificamos password (si user.PasswordHash es undefined, la comparación falla segura)
            const validPassword = await bcrypt.compare(password, user.PasswordHash || '');
            if (!validPassword) return res.status(401).json({ message: 'Credenciales incorrectas' });

            // ⚠️ Generación del Token
            const payload = { UsuarioID: user.UsuarioID, email: user.Email, rol: user.Rol };
            const secret: Secret = EnvConfig.JWT_SECRET;
            // Aseguramos que sea número (default 3600s = 1 hora)
            const expiresInVal = EnvConfig.JWT_EXPIRES_IN ? Number(EnvConfig.JWT_EXPIRES_IN.replace('s','')) : 3600;
            const options: SignOptions = { expiresIn: expiresInVal };

            const token = jwt.sign(payload, secret, options);

            const { PasswordHash, ...userSafe } = user;

            // 2. Enviamos el token Y el usuario
            return res.json({
                token,
                user: userSafe
            });

        } catch (err) {
            console.error('Error en AuthController.login:', err);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}