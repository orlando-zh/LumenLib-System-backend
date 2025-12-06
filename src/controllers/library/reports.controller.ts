import { Request, Response } from 'express';
import { ReportsService } from '@services/library/reports.service';

export class ReportsController {
    private service = new ReportsService();

    async getTopReaders(req: Request, res: Response) {
        try {
            const data = await this.service.getTopReaders();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCategoryStats(req: Request, res: Response) {
        try {
            const data = await this.service.getCategoryStats();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getTopAuthors(req: Request, res: Response) {
        try {
            // Leemos el query param ?min=2
            const minQuery = req.query.min;
            const minBooks = minQuery ? Number(minQuery) : 2;

            if (isNaN(minBooks)) {
                return res.status(400).json({ message: '"min" debe ser un número' });
            }

            const data = await this.service.getTopAuthors(minBooks);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }


    async getActiveBorrowers(req: Request, res: Response) {
        try {
            const data = await this.service.getActiveBorrowers();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: "Error al obtener prestatarios activos", error: error.message });
        }
    }
}