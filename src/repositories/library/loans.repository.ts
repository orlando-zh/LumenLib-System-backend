//Conecta con sp_RegistrarPrestamo y VistaPrestamosActivos.
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { PrestamoActivo } from '@interfaces/library/library.interface';

export class LoansRepository {

    // CREAR: Usa el Stored Procedure con Transacción
    async createLoan(usuarioId: number, libroId: number): Promise<string> {
        try {
            const pool = await dbPool;

            await pool.request()
                .input('UsuarioID', sql.Int, usuarioId)
                .input('LibroID', sql.Int, libroId)
                .execute('sp_RegistrarPrestamo');

            return 'Préstamo realizado con éxito';
        } catch (err: any) {
            console.error('Error en createLoan:', err);
            // Capturamos el error si SQL dice "No hay stock"
            throw new Error(err.message || 'Error al procesar préstamo');
        }
    }

    // LEER: Usa la Vista de Bibliotecario
    async getActiveLoans(): Promise<PrestamoActivo[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaPrestamosActivos');
        return result.recordset;
    }


    // NUEVO: Obtener historial personal
    async getMyLoans(usuarioId: number): Promise<any[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT 
                    L.Titulo,
                    L.ISBN,
                    P.FechaPrestamo,
                    P.FechaDevolucion,
                    -- Columna calculada para el estado
                    CASE 
                        WHEN P.FechaDevolucion IS NULL THEN 'Activo'
                        ELSE 'Devuelto'
                    END as Estado,
                    -- Días que lleva prestado (solo si sigue activo)
                    CASE 
                        WHEN P.FechaDevolucion IS NULL THEN DATEDIFF(day, P.FechaPrestamo, GETDATE())
                        ELSE NULL
                    END as DiasTranscurridos
                FROM Prestamo P
                INNER JOIN Libro L ON P.LibroID = L.LibroID
                WHERE P.UsuarioID = @UsuarioID
                ORDER BY P.FechaPrestamo DESC
            `);
        return result.recordset;
    }


}