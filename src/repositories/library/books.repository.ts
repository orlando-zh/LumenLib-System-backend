// Conecta con VistaCatalogoLibros
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { Libro, CreateBookDTO, UpdateBookDTO, LibroCatalogo } from '@interfaces/library/library.interface';

export class BooksRepository {

    // LEER: Usa la VISTA (VistaCatalogoLibros)
    async getAllCatalog(): Promise<LibroCatalogo[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaCatalogoLibros');
        return result.recordset;
    }

    async getById(id: number): Promise<Libro | null> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('LibroID', sql.Int, id)
            .query('SELECT * FROM Libro WHERE LibroID = @LibroID');
        return result.recordset[0] as Libro || null;
    }

    // BUSCAR POR TÍTULO (GET /books?titulo=...)
    async searchByTitle(searchTerm: string): Promise<LibroCatalogo[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('SearchTerm', sql.NVarChar, `%${searchTerm}%`)
            .query(`
                SELECT * FROM VistaCatalogoLibros 
                WHERE Titulo LIKE @SearchTerm 
                OR ISBN LIKE @SearchTerm -- Bonus: buscar también por ISBN
            `);
        return result.recordset as LibroCatalogo[];
    }


    // ESCRIBIR: Usa la TABLA (Libro)
    async createBook(book: Libro): Promise<Libro> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('Titulo', sql.NVarChar, book.Titulo)
            .input('ISBN', sql.NVarChar, book.ISBN)
            .input('AnioPublicacion', sql.Int, book.AnioPublicacion)
            .input('Stock', sql.Int, book.Stock)
            .input('AutorID', sql.Int, book.AutorID)
            .input('CategoriaID', sql.Int, book.CategoriaID)
            .input('ImagenURL', sql.NVarChar, book.ImagenURL || null)
            .query(`
                INSERT INTO Libro (Titulo, ISBN, AnioPublicacion, Stock, AutorID, CategoriaID, ImagenURL)
                    OUTPUT INSERTED.*
                VALUES (@Titulo, @ISBN, @AnioPublicacion, @Stock, @AutorID, @CategoriaID, @ImagenURL)
            `);
        return result.recordset[0];
    }

// Actualizar un libro (PUT)
    async updateBook(id: number, data: UpdateBookDTO): Promise<Libro | null> {
        const pool = await dbPool;
        let updateFields = [];

        if (data.Titulo !== undefined) updateFields.push("Titulo = @Titulo");
        if (data.ISBN !== undefined) updateFields.push("ISBN = @ISBN");
        if (data.AnioPublicacion !== undefined) updateFields.push("AnioPublicacion = @AnioPublicacion");
        if (data.Stock !== undefined) updateFields.push("Stock = @Stock");
        if (data.AutorID !== undefined) updateFields.push("AutorID = @AutorID");
        if (data.CategoriaID !== undefined) updateFields.push("CategoriaID = @CategoriaID");
        if (data.ImagenURL !== undefined) updateFields.push("ImagenURL = @ImagenURL");

        if (updateFields.length === 0) return null;

        const request = pool.request().input('LibroID', sql.Int, id);

        // Asignar inputs dinámicamente o todos (SQL ignorará los que no estén en el SET)
        if (data.Titulo) request.input('Titulo', sql.NVarChar, data.Titulo);
        if (data.ISBN) request.input('ISBN', sql.NVarChar, data.ISBN);
        if (data.AnioPublicacion) request.input('AnioPublicacion', sql.Int, data.AnioPublicacion);
        if (data.Stock) request.input('Stock', sql.Int, data.Stock);
        if (data.AutorID) request.input('AutorID', sql.Int, data.AutorID);
        if (data.CategoriaID) request.input('CategoriaID', sql.Int, data.CategoriaID);
        if (data.ImagenURL !== undefined) request.input('ImagenURL', sql.NVarChar, data.ImagenURL);

        // ... query de update igual que antes
        const result = await request.query(`
            UPDATE Libro 
            SET ${updateFields.join(', ')}
            OUTPUT INSERTED.*
            WHERE LibroID = @LibroID
        `);

        return result.recordset[0] as Libro || null;
    }

    // Eliminar un libro (DELETE)
    async deleteBook(id: number): Promise<boolean> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('LibroID', sql.Int, id)
            .query('DELETE FROM Libro WHERE LibroID = @LibroID');

        // rowsAffected[0] será 1 si eliminó una fila, 0 si no encontró el ID.
        return result.rowsAffected[0] > 0;
    }
}