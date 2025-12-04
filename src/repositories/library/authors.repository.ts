import sql from 'mssql';
import { dbPool } from '@config/db.config';
// Usamos la interfaz Autor que ahora está exportada correctamente
import { Autor } from '@interfaces/library/library.interface';

export class AuthorsRepository {

    // Obtener todos los autores
    async getAll(): Promise<Autor[]> {
        try {
            const pool = await dbPool;
            const result = await pool.request().query('SELECT AutorID, Nombre, Nacionalidad FROM Autor');
            return result.recordset;
        } catch (error) {
            console.error('Error in AuthorsRepository.getAll:', error);
            throw new Error('Database error while fetching authors');
        }
    }

    // Crear un nuevo autor
    async create(autor: Autor): Promise<Autor> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('Nombre', sql.NVarChar, autor.Nombre)
                .input('Nacionalidad', sql.NVarChar, autor.Nacionalidad || null)
                .query(`
                    INSERT INTO Autor (Nombre, Nacionalidad)
                    OUTPUT INSERTED.AutorID, INSERTED.Nombre, INSERTED.Nacionalidad
                    VALUES (@Nombre, @Nacionalidad)
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('Error in AuthorsRepository.create:', error);
            throw new Error('Database error while creating author');
        }
    }
}