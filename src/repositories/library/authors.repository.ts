import sql from 'mssql';
import { dbPool } from '@config/db.config';
// Usamos la interfaz Autor que ahora está exportada correctamente
import { Autor, UpdateAuthorDTO } from '@interfaces/library/library.interface';

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


    // 3. Actualizar un autor
    async update(id: number, data: UpdateAuthorDTO): Promise<Autor | null> {
        const pool = await dbPool;
        // Solo actualizamos Nombre y Nacionalidad si vienen en los datos
        let updateFields = [];
        if (data.Nombre !== undefined) updateFields.push("Nombre = @Nombre");
        if (data.Nacionalidad !== undefined) updateFields.push("Nacionalidad = @Nacionalidad");

        if (updateFields.length === 0) return null; // No hay nada que actualizar

        const result = await pool.request()
            .input('AutorID', sql.Int, id)
            .input('Nombre', sql.NVarChar, data.Nombre || null)
            .input('Nacionalidad', sql.NVarChar, data.Nacionalidad || null)
            .query(`
            UPDATE Autor 
            SET ${updateFields.join(', ')}
            OUTPUT INSERTED.AutorID, INSERTED.Nombre, INSERTED.Nacionalidad
            WHERE AutorID = @AutorID
        `);

        return result.recordset[0] || null;
    }

// 4. Eliminar un autor
    async delete(id: number): Promise<boolean> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('AutorID', sql.Int, id)
            .query('DELETE FROM Autor WHERE AutorID = @AutorID');

        return result.rowsAffected[0] > 0;
    }


    // 5. OBTENER POR ID (GET /authors/:id)
    async getById(id: number): Promise<Autor | null> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('AutorID', sql.Int, id)
                .query('SELECT AutorID, Nombre, Nacionalidad FROM Autor WHERE AutorID = @AutorID');
            return result.recordset[0] as Autor || null;
        } catch (error) {
            console.error('Error in AuthorsRepository.getById:', error);
            throw new Error('Database error while fetching author by ID');
        }
    }

    // 6. BUSCAR POR NOMBRE (GET)
    async searchByName(searchTerm: string): Promise<Autor[]> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('SearchTerm', sql.NVarChar, `%${searchTerm}%`)
                .query(`
                    SELECT AutorID, Nombre, Nacionalidad 
                    FROM Autor 
                    WHERE Nombre LIKE @SearchTerm
                `);
            return result.recordset as Autor[];
        } catch (error) {
            console.error('Error in AuthorsRepository.searchByName:', error);
            throw new Error('Database error while searching authors');
        }
    }
}