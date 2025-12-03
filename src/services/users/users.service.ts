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


    async updateUser(id: number, changes: Partial<Usuario> & { Password?: string }): Promise<Usuario> {

        const currentUser = await this.repository.getUserById(id);

        if (!currentUser) {
            throw new Error('Usuario no encontrado');
        }

        let newPasswordHash = currentUser.PasswordHash;

        if (changes.Password && changes.Password.trim() !== '') {
            newPasswordHash = await bcrypt.hash(changes.Password, 10);
        }

        const userToUpdate: Usuario = {
            ...currentUser,
            NombreCompleto: changes.NombreCompleto || currentUser.NombreCompleto,
            Email: changes.Email || currentUser.Email,
            Rol: changes.Rol || currentUser.Rol,
            PasswordHash: newPasswordHash
        };

        return this.repository.updateUser(id, userToUpdate);
    }
}