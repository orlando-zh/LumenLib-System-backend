// @repositories/library/categories.repository.ts
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { Categoria, CreateCategoryDTO, UpdateCategoryDTO } from '@interfaces/library/library.interface'; // Asegúrate de importar las interfaces

export class CategoriesRepository {

    // 1. Obtener todas las categorías (GET)
    async getAll(): Promise<Categoria[]> {
        try {
            const pool = await dbPool;
            const result = await pool.request().query('SELECT CategoriaID, NombreCategoria FROM Categoria');
            return result.recordset as Categoria[];
        } catch (error) {
            console.error('Error in CategoriesRepository.getAll:', error);
            throw new Error('Database error while fetching categories');
        }
    }

    // 2. Crear una nueva categoría (POST)
    async create(category: CreateCategoryDTO): Promise<Categoria> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('NombreCategoria', sql.NVarChar, category.NombreCategoria)
                .query(`
                    INSERT INTO Categoria (NombreCategoria)
                    OUTPUT INSERTED.CategoriaID, INSERTED.NombreCategoria
                    VALUES (@NombreCategoria)
                `);
            return result.recordset[0] as Categoria;
        } catch (error) {
            console.error('Error in CategoriesRepository.create:', error);
            // Error 2627 (Unique constraint violation) es común aquí.
            throw new Error('Database error while creating category');
        }
    }

    // 3. Actualizar una categoría (PUT)
    async update(id: number, data: UpdateCategoryDTO): Promise<Categoria | null> {
        if (!data.NombreCategoria) {
            // No hay nada que actualizar
            return null;
        }

        const pool = await dbPool;
        const result = await pool.request()
            .input('CategoriaID', sql.Int, id)
            .input('NombreCategoria', sql.NVarChar, data.NombreCategoria)
            .query(`
                UPDATE Categoria 
                SET NombreCategoria = @NombreCategoria
                OUTPUT INSERTED.CategoriaID, INSERTED.NombreCategoria
                WHERE CategoriaID = @CategoriaID
            `);

        return result.recordset[0] || null;
    }

    // 4. Eliminar una categoría (DELETE)
    async delete(id: number): Promise<boolean> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('CategoriaID', sql.Int, id)
            .query('DELETE FROM Categoria WHERE CategoriaID = @CategoriaID');

        // rowCount > 0 indica que se eliminó una fila
        return result.rowsAffected[0] > 0;
    }

    // 5. OBTENER POR ID (GET /categories/:id)
    async getById(id: number): Promise<Categoria | null> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('CategoriaID', sql.Int, id)
                .query('SELECT CategoriaID, NombreCategoria FROM Categoria WHERE CategoriaID = @CategoriaID');
            return result.recordset[0] as Categoria || null;
        } catch (error) {
            console.error('Error in CategoriesRepository.getById:', error);
            throw new Error('Database error while fetching category by ID');
        }
    }

    // 6. BUSCAR CATEGORÍAS POR NOMBRE (GET /categories?nombre=...)
    async searchByName(searchTerm: string): Promise<Categoria[]> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                // El campo en la DB es NombreCategoria
                .input('SearchTerm', sql.NVarChar, `%${searchTerm}%`)
                .query(`
                    SELECT CategoriaID, NombreCategoria
                    FROM Categoria
                    WHERE NombreCategoria LIKE @SearchTerm
                `);
            return result.recordset as Categoria[];
        } catch (error) {
            console.error('Error in CategoriesRepository.searchByName:', error);
            throw new Error('Database error while searching categories');
        }
    }
}