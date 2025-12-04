// Conecta con las Vistas de Reportes y el SP Dinámico.
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { TopLector, CategoriaStat, AutorTop } from '@interfaces/library/library.interface';

export class ReportsRepository {

    // Vista: Top Lectores (Solo Lectores reales)
    async getTopReaders(): Promise<TopLector[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .query('SELECT * FROM VistaTopLectores ORDER BY TotalLibrosPrestados DESC');
        return result.recordset;
    }

    // Vista: Inventario por Categoría
    async getCategoryStats(): Promise<CategoriaStat[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaConteoPorCategoria');
        return result.recordset;
    }

    // SP Dinámico: Autores Top (HAVING)
    async getTopAuthors(minBooks: number): Promise<AutorTop[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('CantidadMinima', sql.Int, minBooks)
            .execute('sp_ObtenerAutoresTop');
        return result.recordset;
    }
}