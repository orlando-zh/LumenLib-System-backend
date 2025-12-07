// loans.repository.ts
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { PrestamoActivo, HistorialPersonal } from '@interfaces/library/library.interface';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';
import { AppError } from '../../utils/AppError';

export class LoansRepository {

    // Registrar préstamo
    async executeLoan(data: LoanTransactionDTO): Promise<void> {
        try {
            const pool = await dbPool;

            await pool.request()
                .input('UsuarioID', sql.Int, data.UsuarioID)
                .input('LibroID', sql.Int, data.LibroID)
                .execute('sp_RegistrarPrestamo');

        } catch (err: any) {
            console.error('Error en executeLoan:', err);

            if (err.message && err.message.includes('prestamo_activo')) {
                throw new AppError('El usuario ya tiene un préstamo activo de este libro pendiente de devolución.', 409);
            }

            if (err.message && err.message.includes('stock')) {
                throw new AppError('No hay stock disponible para este libro en este momento.', 409);
            }

            throw new AppError('Error interno al procesar el préstamo.', 500);
        }
    }

    // Obtener préstamos activos
    async getActiveLoans(): Promise<PrestamoActivo[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaPrestamosActivos');
        return result.recordset as PrestamoActivo[];
    }

    // Obtener historial personal
    async getMyHistory(usuarioId: number): Promise<HistorialPersonal[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuarioId)
            .query(`
                SELECT
                    P.PrestamoID,  
                    P.LibroID, 
                    L.Titulo,
                    L.ISBN,
                    P.FechaPrestamo,
                    P.FechaDevolucion,
                    CASE WHEN P.FechaDevolucion IS NULL THEN 'Activo' ELSE 'Devuelto' END AS Estado,
                    CASE WHEN P.FechaDevolucion IS NULL
                             THEN DATEDIFF(day, P.FechaPrestamo, GETDATE())
                         ELSE NULL END AS DiasTranscurridos
                FROM Prestamo P
                         INNER JOIN Libro L ON P.LibroID = L.LibroID
                WHERE P.UsuarioID = @UsuarioID
                ORDER BY P.FechaPrestamo DESC
            `);

        return result.recordset as HistorialPersonal[];
    }

    // Devolver por PrestamoID
    async returnByLoanId(prestamoId: number): Promise<void> {
        try {
            const pool = await dbPool;

            await pool.request()
                .input("PrestamoID", sql.Int, prestamoId)
                .execute("sp_DevolverPorPrestamoID");

        } catch (err: any) {
            console.error("Error en returnByLoanId:", err);
            throw new AppError("No se pudo devolver el libro.", 500);
        }
    }

// 5. Devolver libro por UsuarioID + LibroID
    async returnByUserAndBook(usuarioId: number, libroId: number): Promise<void> {
        try {
            const pool = await dbPool;

            await pool.request()
                .input("UsuarioID", sql.Int, usuarioId)
                .input("LibroID", sql.Int, libroId)
                .execute("sp_DevolverPorUsuarioLibro");

        } catch (err: any) {
            console.error("Error en returnByUserAndBook:", err);
            throw new AppError("No se pudo devolver el libro.", 500);
        }
    }
}