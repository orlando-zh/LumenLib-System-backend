import { UsersRepository } from '@repositories/users/users.repository';
import { Usuario } from '@interfaces/users/users.interface';
import bcrypt from 'bcrypt';

export class UsersService {
    private repository = new UsersRepository();

    async getAllUsers(): Promise<Usuario[]> {
        return this.repository.getAll();
    }

    async createUser(data: Partial<Usuario> & { Password: string }): Promise<Usuario> {
        if (!data.NombreCompleto || !data.Email || !data.Password) {
            throw new Error("NombreCompleto, Email y Password son obligatorios");
        }

        const hashedPassword = await bcrypt.hash(data.Password, 10);

        const user: Usuario = {
            NombreCompleto: data.NombreCompleto,
            Email: data.Email,
            PasswordHash: hashedPassword,
            Rol: data.Rol || 'Lector'
        };

        return this.repository.createUser(user);
    }
}
