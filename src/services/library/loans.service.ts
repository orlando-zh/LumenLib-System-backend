import { LoansRepository } from '@repositories/library/loans.repository';

export class LoansService {
    private repository = new LoansRepository();

    async createLoan(usuarioId: number, libroId: number) {
        if (!usuarioId || !libroId) {
            throw new Error('UsuarioID y LibroID son obligatorios');
        }
        return await this.repository.createLoan(usuarioId, libroId);
    }

    async getActiveLoans() {
        return await this.repository.getActiveLoans();
    }
}