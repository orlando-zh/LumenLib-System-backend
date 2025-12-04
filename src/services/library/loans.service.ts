import { LoansRepository } from '@repositories/library/loans.repository';
import { UsersRepository } from '@repositories/users/users.repository';

export class LoansService {
    private repository = new LoansRepository();
    private usersRepository = new UsersRepository();

    async createLoan(usuarioId: number, libroId: number) {
        if (!usuarioId || !libroId) {
            throw new Error('UsuarioID y LibroID son obligatorios');
        }
        return await this.repository.createLoan(usuarioId, libroId);
    }

    async getActiveLoans() {
        return await this.repository.getActiveLoans();
    }

    async getMyLoans(usuarioId: number) {
        // 1. Validación básica de entrada
        if (!usuarioId) {
            throw new Error("ID de usuario inválido");
        }

        // 2. Validación de existencia en BD (Seguridad Extra)
        // Buscamos al usuario para asegurarnos que no ha sido borrado
        const user = await this.usersRepository.getUserById(usuarioId);

        if (!user) {
            throw new Error("El usuario asociado al token ya no existe.");
        }

        // 3. Si existe, traemos sus préstamos
        return await this.repository.getMyLoans(usuarioId);
    }
}