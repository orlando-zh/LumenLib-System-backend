import { LoansRepository } from '@repositories/library/loans.repository';
import { UsersRepository } from '@repositories/users/users.repository';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';
import { PrestamoActivo, HistorialPersonal } from '@interfaces/library/library.interface';

export class LoansService {
    private repository = new LoansRepository();
    private usersRepository = new UsersRepository();

    // 1. Ejecutar Préstamo (POST /api/library/loans)
    // Recibe el DTO, que es el cuerpo de la petición.
    async createLoan(data: LoanTransactionDTO): Promise<void> {
        // Validación básica (aunque el controlador ya la hace, la redundancia es buena)
        if (!data.UsuarioID || !data.LibroID) {
            throw new Error('UsuarioID y LibroID son obligatorios.');
        }

        // Ejecuta el stored procedure a través del repositorio.
        // El repositorio ya tiene la lógica de llamar al SP y manejar las excepciones.
        await this.repository.executeLoan(data);
    }

    // 2. Consultar Préstamos Activos (GET /api/library/loans/active)
    async getActiveLoans(): Promise<PrestamoActivo[]> {
        return await this.repository.getActiveLoans();
    }

    // 3. Consultar Historial Personal (GET /api/library/loans/my-history)
    async getMyHistory(usuarioId: number): Promise<HistorialPersonal[]> {
        // 1. Validación de entrada
        if (!usuarioId) {
            throw new Error("ID de usuario inválido.");
        }
        const user = await this.usersRepository.getById(usuarioId);

        if (!user) {
            throw new Error("El usuario asociado al token ya no existe.");
        }
        return await this.repository.getMyHistory(usuarioId);
    }
}