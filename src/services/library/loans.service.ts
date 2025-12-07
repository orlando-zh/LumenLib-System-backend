import { LoansRepository } from '@repositories/library/loans.repository';
import { UsersRepository } from '@repositories/users/users.repository';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';
import { PrestamoActivo, HistorialPersonal } from '@interfaces/library/library.interface';

export class LoansService {
    private repository = new LoansRepository();
    private usersRepository = new UsersRepository();

    // 1. Ejecutar Préstamo (POST /api/library/loans)
    async createLoan(data: LoanTransactionDTO): Promise<void> {
        if (!data.UsuarioID || !data.LibroID) {
            throw new Error('UsuarioID y LibroID son obligatorios.');
        }
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



    async returnLoanByPrestamoId(prestamoId: number): Promise<void> {
        if (!prestamoId) {
            throw new Error("PrestamoID inválido.");
        }

        await this.repository.returnByLoanId(prestamoId);
    }


// 5. Devolver por UsuarioID + LibroID

    async returnLoanByUsuarioLibro(usuarioId: number, libroId: number): Promise<void> {
        if (!usuarioId || !libroId) {
            throw new Error("UsuarioID y LibroID son obligatorios.");
        }

        await this.repository.returnByUserAndBook(usuarioId, libroId);
    }
}