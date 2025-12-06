// Conecta con sp_RegistrarPrestamo y VistaPrestamosActivos.
import sql from 'mssql';
import { dbPool } from '@config/db.config';
// ⬅️ Importamos los tipos necesarios, incluyendo los nuevos
import { PrestamoActivo, HistorialPersonal } from '@interfaces/library/library.interface';
import { LoanTransactionDTO } from '@interfaces/loans/loan.interface';

export class LoansRepository {

    // 1. Ejecutar Préstamo (Transacción) - ACTUALIZADO
    // El servicio llama a esta función con el DTO (data).
    async executeLoan(data: LoanTransactionDTO): Promise<void> {
        try {
            const pool = await dbPool;

            // ✅ CORRECCIÓN FINAL: Los nombres de los inputs coinciden con la librería MSSQL
            // (Sin el símbolo @, ya que MSSQL lo añade internamente).
            await pool.request()
                .input('UsuarioID', sql.Int, data.UsuarioID)
                .input('LibroID', sql.Int, data.LibroID)
                .execute('sp_RegistrarPrestamo');

        } catch (err: any) {
            console.error('Error en executeLoan:', err);
            throw new Error(err.message || 'Error al procesar préstamo');
        }
    }

    // 2. Consultar Préstamos Activos (VistaPrestamosActivos)
    async getActiveLoans(): Promise<PrestamoActivo[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaPrestamosActivos');
        // ⬅️ Tipado de retorno
        return result.recordset as PrestamoActivo[];
    }


    // 3. Obtener Historial Personal - ACTUALIZADO y TIPADO
    async getMyHistory(usuarioId: number): Promise<HistorialPersonal[]> { // ⬅️ CAMBIO DE NOMBRE AQUÍ
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
        return result.recordset as HistorialPersonal[];
    }
}