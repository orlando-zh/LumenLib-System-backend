import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { TopLector, CategoriaStat, AutorTop } from '@interfaces/library/library.interface';

export class ReportsRepository {

    // 1. Vista: Top Lectores (CORREGIDA Y ÚNICA)
    async getTopReaders(): Promise<TopLector[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .query('SELECT * FROM VistaTopLectores ORDER BY TotalLibrosPrestados DESC');
        return result.recordset;
    }

    // 2. Vista: Inventario por Categoría
    async getCategoryStats(): Promise<CategoriaStat[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaConteoPorCategoria');
        return result.recordset;
    }

    // 3. SP Dinámico: Autores Top (HAVING)
    async getTopAuthors(minBooks: number, top = 6): Promise<AutorTop[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('CantidadMinima', sql.Int, minBooks)
            .input('Top', sql.Int, top)
            .execute('sp_ObtenerAutoresTop');

        return result.recordset;
    }

    async getActiveBorrowers() {
        const pool = await dbPool;
        const result = await pool.request().query(`
            SELECT
                u.UsuarioID,
                u.NombreCompleto,
                COUNT(p.PrestamoID) AS PrestamosActivos
            FROM Prestamo p
                     INNER JOIN Usuario u ON u.UsuarioID = p.UsuarioID
            WHERE p.FechaDevolucion IS NULL
            GROUP BY u.UsuarioID, u.NombreCompleto
            ORDER BY PrestamosActivos DESC;
        `);

        return result.recordset;
    }
}