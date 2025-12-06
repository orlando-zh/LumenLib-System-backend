import { Request, Response } from 'express';
import { LoansService } from '@services/library/loans.service';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';

export class LoansController {
    private service = new LoansService();

    // 1. POST /api/library/loans (Realizar Préstamo)
    async createLoan(req: Request, res: Response): Promise<void> {
        const data = req.body as LoanTransactionDTO;

        if (!data.UsuarioID || !data.LibroID) {
            res.status(400).json({ message: 'Faltan UsuarioID y/o LibroID para registrar el préstamo.' });
            return;
        }

        try {
            await this.service.createLoan(data);
            res.status(201).json({ message: 'Préstamo registrado con éxito.' });
        } catch (error: any) {
            console.error('Error al registrar préstamo:', error.message);
            const isStockError = error.message.includes('stock');

            res.status(isStockError ? 400 : 500).json({
                message: isStockError
                    ? 'Préstamo fallido: No hay stock disponible o el ID del libro es inválido.'
                    : 'Error interno del servidor al procesar el préstamo.'
            });
        }
    }

    // 2. GET /api/library/loans/active (Supervisión)
    async getActiveLoans(req: Request, res: Response): Promise<void> {
        try {
            const loans = await this.service.getActiveLoans();
            res.status(200).json(loans);
        } catch (error: any) {
            console.error('Error fetching active loans:', error);
            res.status(500).json({ message: 'Error al consultar préstamos activos.' });
        }
    }

    // 3. GET /api/library/loans/my-history (Historial Lector)
    // Se elimina la primera definición duplicada. Mantenemos la lógica de seguridad.
    async getMyHistory(req: Request, res: Response): Promise<void> {
        // 🔹 Usar userAuth que puso el middleware
        const usuarioId = (req as any).body.userAuth?.UsuarioID;

        if (!usuarioId) {
            res.status(401).json({ message: 'Usuario no autenticado o ID de token faltante.' });
            return;
        }

        try {
            const loans = await this.service.getMyHistory(usuarioId);
            res.status(200).json(loans);
        } catch (error: any) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ message: 'Error al obtener historial personal.' });
        }
    }
}