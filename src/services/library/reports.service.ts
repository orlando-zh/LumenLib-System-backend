import { ReportsRepository } from '@repositories/library/reports.repository';

export class ReportsService {
    private repository = new ReportsRepository();

    async getTopReaders() {
        return await this.repository.getTopReaders();
    }

    async getCategoryStats() {
        return await this.repository.getCategoryStats();
    }

    async getTopAuthors(min: number) {
        // Si mandan negativo, lo corregimos a 0 o 1
        const safeMin = min < 0 ? 0 : min;
        return await this.repository.getTopAuthors(safeMin);
    }
}