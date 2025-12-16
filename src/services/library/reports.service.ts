import { ReportsRepository } from '@repositories/library/reports.repository';
import { DASHBOARD_RULES } from '@constants/dashboard.rules';
import { TopLector, CategoriaStat, AutorTop } from '@interfaces/library/library.interface';

export class ReportsService {
    private repository = new ReportsRepository();

    async getTopReaders(): Promise<TopLector[]> {
        return this.repository.getTopReaders();
    }

    async getCategoryStats(): Promise<CategoriaStat[]> {
        return this.repository.getCategoryStats();
    }

    async getTopAuthors(): Promise<AutorTop[]> {
        const { MIN_BOOKS, LIMIT } = DASHBOARD_RULES.TOP_AUTHORS;

        return this.repository.getTopAuthors(MIN_BOOKS, LIMIT);
    }

    async getActiveBorrowers() {
        return this.repository.getActiveBorrowers();
    }
}
