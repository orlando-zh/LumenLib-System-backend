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
            const data = await this.service.getTopAuthors();
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
            res.status(500).json({
                message: "Error al obtener prestatarios activos",
                error: error.message
            });
        }
    }
}
