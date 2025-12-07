// loans.controller.ts
import { Request, Response } from 'express';
import { LoansService } from '@services/library/loans.service';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';

export class LoansController {
    private service = new LoansService();

    // 1. POST /api/library/loans (Realizar Préstamo)
    async createLoan(req: Request, res: Response): Promise<void> {
        const data = req.body as LoanTransactionDTO;

        // Validación básica de entrada
        if (!data.UsuarioID || !data.LibroID) {
            res.status(400).json({ message: 'Faltan UsuarioID y/o LibroID para registrar el préstamo.' });
            return;
        }

        try {
            await this.service.createLoan(data);
            res.status(201).json({ message: 'Préstamo registrado con éxito.' });

        } catch (error: any) {
            // ⚠️ CAMBIO CRÍTICO AQUÍ
            // Si el error viene del Repo (AppError), usamos su statusCode (ej. 409) y su mensaje.
            // Si es un error desconocido, usamos 500.

            const statusCode = error.statusCode || 500;
            const message = error.message || 'Error interno del servidor al procesar el préstamo.';

            console.error(`Error en createLoan (${statusCode}):`, message);

            res.status(statusCode).json({ message });
        }
    }

    // 2. GET /api/library/loans/active (Supervisión)
    async getActiveLoans(req: Request, res: Response): Promise<void> {
        try {
            const loans = await this.service.getActiveLoans();
            res.status(200).json(loans);
        } catch (error: any) {
            console.error('Error fetching active loans:', error);
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message || 'Error al consultar préstamos activos.' });
        }
    }

    // 3. GET /api/library/loans/my-history (Historial Lector)
    async getMyHistory(req: Request, res: Response): Promise<void> {
        // Mantenemos tu lógica de userAuth intacta
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
            const statusCode = error.statusCode || 500;
            res.status(statusCode).json({ message: error.message || 'Error al obtener historial personal.' });
        }
    }

    // 4. Devolución por ID de Préstamo
    async returnByPrestamoId(req: Request, res: Response): Promise<void> {
        const prestamoId = Number(req.params.prestamoId);

        try {
            await this.service.returnLoanByPrestamoId(prestamoId);
            res.status(200).json({ message: "Libro devuelto correctamente." });
        } catch (error: any) {
            // Estandarizamos para usar 'message' en lugar de 'error' para que el frontend no se confunda
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Error desconocido al devolver.';
            res.status(statusCode).json({ message });
        }
    }

    // 5. Devolución por Usuario y Libro
    async returnByUsuarioLibro(req: Request, res: Response): Promise<void> {
        const { UsuarioID, LibroID }: { UsuarioID: number; LibroID: number } = req.body;

        try {
            await this.service.returnLoanByUsuarioLibro(UsuarioID, LibroID);
            res.status(200).json({ message: "Libro devuelto correctamente." });
        } catch (error: any) {
            const statusCode = error.statusCode || 500;
            const message = error.message || 'Error desconocido al devolver.';
            res.status(statusCode).json({ message });
        }
    }
}