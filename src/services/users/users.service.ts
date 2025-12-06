// users.service.ts (COMPLETO con la función DELETE)
import { UsersRepository } from '@repositories/users/users.repository';
import { Usuario, CreateUserDTO, UpdateUserDTO } from '@interfaces/users/users.interface';
import bcrypt from 'bcrypt';

export class UsersService {
    private repository = new UsersRepository();

    // 🚨 Modificado: Usa el nuevo método search del Repository (que limpia el hash)
    async getAllUsers(searchTerm?: string): Promise<Usuario[]> {
        if (searchTerm) {
            return this.repository.searchByName(searchTerm);
        }
        return this.repository.getAll();
    }

    // 🚨 NUEVO: Obtener Usuario por ID (Método clave para el Controller)
    async getUserById(id: number): Promise<Usuario> {
        const user = await this.repository.getById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    }

    async createUser(data: CreateUserDTO & { Password: string }): Promise<Usuario> {
        if (!data.NombreCompleto || !data.Email || !data.Password) {
            throw new Error("NombreCompleto, Email y Password son obligatorios");
        }

        const hashedPassword = await bcrypt.hash(data.Password, 10);

        const userWithHash = {
            NombreCompleto: data.NombreCompleto,
            Email: data.Email,
            PasswordHash: hashedPassword,
            Rol: data.Rol || 'Lector'
        };

        return this.repository.createUser(userWithHash);
    }

    async updateUser(id: number, changes: UpdateUserDTO & { Password?: string }): Promise<Usuario> {

        // 🚨 CAMBIO: Usamos getById del Repository
        const currentUser = await this.repository.getById(id);

        if (!currentUser) {
            throw new Error('Usuario no encontrado');
        }

        let newPasswordHash = currentUser.PasswordHash;

        if (changes.Password && changes.Password.trim() !== '') {
            newPasswordHash = await bcrypt.hash(changes.Password, 10);
        }

        const userToUpdate: UpdateUserDTO & { PasswordHash?: string } = {
            NombreCompleto: changes.NombreCompleto,
            Email: changes.Email,
            Rol: changes.Rol,
            PasswordHash: newPasswordHash
        };

        const updatedUser = await this.repository.updateUser(id, userToUpdate);

        if (!updatedUser) {
            throw new Error('Usuario no encontrado');
        }
        return updatedUser;
    }

    // 🚀 FUNCIÓN AGREGADA: Eliminar Usuario
    async deleteUser(id: number): Promise<void> {
        const deleted = await this.repository.deleteUser(id);
        if (!deleted) {
            throw new Error(`No se pudo eliminar el usuario con ID ${id}. Puede que no exista o tenga préstamos activos.`);
        }
    }
}