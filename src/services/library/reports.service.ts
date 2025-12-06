import { ReportsRepository } from '@repositories/library/reports.repository';
// ⬅️ Importamos las interfaces que definen el contrato de datos
import { TopLector, CategoriaStat, AutorTop } from '@interfaces/library/library.interface';

export class ReportsService {
    private repository = new ReportsRepository();

    async getTopReaders(): Promise<TopLector[]> {
        return await this.repository.getTopReaders();
    }

    async getCategoryStats(): Promise<CategoriaStat[]> {
        return await this.repository.getCategoryStats();
    }

    async getTopAuthors(min: number): Promise<AutorTop[]> {
        const safeMin = min < 1 ? 1 : min;
        return await this.repository.getTopAuthors(safeMin);
    }

    async getActiveBorrowers() {
        return await this.repository.getActiveBorrowers();
    }
}

