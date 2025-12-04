import { Request, Response } from 'express';
import { LoansService } from '@services/library/loans.service';

export class LoansController {
    private service = new LoansService();

    async createLoan(req: Request, res: Response) {
        try {
            const { usuarioId, libroId } = req.body;
            // Llamada al SP que maneja la transacción
            const message = await this.service.createLoan(usuarioId, libroId);
            res.status(201).json({ message });
        } catch (error: any) {
            // Error 400 si falta stock o datos inválidos
            res.status(400).json({ message: 'Préstamo fallido', error: error.message });
        }
    }

    async getActiveLoans(req: Request, res: Response) {
        try {
            const loans = await this.service.getActiveLoans();
            res.json(loans);
        } catch (error: any) {
            res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }

    // Endpoint para que el lector vea sus libros
    async getMyLoans(req: Request, res: Response) {
        try {
            // El middleware 'isAuthenticated' ya decodificó el token aquí:
            const usuarioId = req.body.userAuth.UsuarioID;

            if (!usuarioId) {
                return res.status(400).json({ message: 'No se pudo identificar al usuario' });
            }

            const loans = await this.service.getMyLoans(usuarioId);
            res.json(loans);
        } catch (error: any) {
            res.status(500).json({ message: 'Error al obtener historial', error: error.message });
        }
    }
}