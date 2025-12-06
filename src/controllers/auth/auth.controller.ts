import { Request, Response } from 'express';
import { UsersRepository } from '@repositories/users/users.repository';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { EnvConfig } from '@config/app.config';

const usersRepo = new UsersRepository();

export class AuthController {
    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        // 1. Validación básica
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password son requeridos' });
        }

        try {
            // Usamos el método específico que SÍ devuelve el PasswordHash y busca directo por SQL.
            const user = await usersRepo.findByEmailWithPassword(email);

            // Si no existe el usuario, devolvemos 401
            if (!user) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            const validPassword = await bcrypt.compare(password, user.PasswordHash || '');

            if (!validPassword) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            const payload = { UsuarioID: user.UsuarioID, email: user.Email, rol: user.Rol };
            const secret: Secret = EnvConfig.JWT_SECRET;

            const expiresInVal = EnvConfig.JWT_EXPIRES_IN
                ? Number(EnvConfig.JWT_EXPIRES_IN.toString().replace('s',''))
                : 3600;

            const options: SignOptions = { expiresIn: expiresInVal };
            const token = jwt.sign(payload, secret, options);
            const { PasswordHash, ...userSafe } = user;

            // 5. Respuesta Exitosa
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