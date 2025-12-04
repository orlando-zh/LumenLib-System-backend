// Conecta con VistaCatalogoLibros
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { Libro, LibroCatalogo } from '@interfaces/library/library.interface';

export class BooksRepository {

    // LEER: Usa la VISTA (VistaCatalogoLibros)
    async getAllCatalog(): Promise<LibroCatalogo[]> {
        const pool = await dbPool;
        const result = await pool.request().query('SELECT * FROM VistaCatalogoLibros');
        return result.recordset;
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
            .query(`
                INSERT INTO Libro (Titulo, ISBN, AnioPublicacion, Stock, AutorID, CategoriaID)
                OUTPUT INSERTED.*
                VALUES (@Titulo, @ISBN, @AnioPublicacion, @Stock, @AutorID, @CategoriaID)
            `);
        return result.recordset[0];
    }
}