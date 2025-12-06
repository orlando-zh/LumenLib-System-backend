// users.repository.ts
import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { Usuario, CreateUserDTO, UpdateUserDTO } from '@interfaces/users/users.interface';

export class UsersRepository {

    // 1. Obtener todos los usuarios (Catálogo de Admin)
    async getAll(): Promise<Usuario[]> {
        try {
            const pool = await dbPool;

            const result = await pool.request().query(`
                SELECT
                    UsuarioID,
                    NombreCompleto,
                    Email,
                    Rol,
                    FechaCreacion,
                    FechaActualizacion
                FROM Usuario
            `);

            return result.recordset;
        } catch (err) {
            console.error('Error en UsersRepository.getAll:', err);
            throw new Error('Database error while fetching users');
        }
    }

    // 2. Crear un nuevo usuario
    async createUser(user: CreateUserDTO & { PasswordHash: string }): Promise<Usuario> {
        try {
            const pool = await dbPool;

            const result = await pool.request()
                .input('NombreCompleto', sql.NVarChar, user.NombreCompleto)
                .input('Email', sql.NVarChar, user.Email)
                .input('PasswordHash', sql.NVarChar, user.PasswordHash)
                .input('Rol', sql.NVarChar, user.Rol)
                .query(`
                    INSERT INTO Usuario (NombreCompleto, Email, PasswordHash, Rol)
                        OUTPUT
                        INSERTED.UsuarioID,
                        INSERTED.NombreCompleto,
                        INSERTED.Email,
                        INSERTED.Rol,
                        INSERTED.FechaCreacion,
                        INSERTED.FechaActualizacion -- No devolvemos el hash
                    VALUES (@NombreCompleto, @Email, @PasswordHash, @Rol)
                `);

            return result.recordset[0];
        } catch (err: any) {
            console.error('Error en UsersRepository.createUser:', err);
            if ('number' in err && err.number === 2627) {
                throw new Error('El email ya está registrado');
            }
            throw new Error('Error al crear usuario en la base de datos');
        }
    }

    async findByEmailWithPassword(email: string): Promise<Usuario | undefined> {
        try {
            const pool = await dbPool;
            const result = await pool.request()
                .input('Email', sql.NVarChar, email)
                .query(`
                    SELECT 
                        UsuarioID, 
                        NombreCompleto, 
                        Email, 
                        Rol, 
                        PasswordHash 
                    FROM Usuario 
                    WHERE Email = @Email
                `);
            return result.recordset[0];
        } catch (error) {
            console.error('Error en findByEmailWithPassword:', error);
            throw new Error('Database error');
        }
    }


    // 3. Obtener Usuario por ID (Detalle/Edición)
    async getById(id: number): Promise<Usuario | null> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, id)
            .query(`SELECT 
                        UsuarioID, NombreCompleto, Email, Rol, FechaCreacion, FechaActualizacion 
                    FROM Usuario 
                    WHERE UsuarioID = @UsuarioID`);
        // Aseguramos que solo devuelve el objeto o null
        return result.recordset[0] as Usuario || null;
    }

    // 4. Buscar Usuarios por Nombre (Usado por GET /users?nombre=...)
    async searchByName(searchTerm: string): Promise<Usuario[]> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('SearchTerm', sql.NVarChar, `%${searchTerm}%`)
            .query(`
                SELECT UsuarioID, NombreCompleto, Email, Rol, FechaCreacion, FechaActualizacion
                FROM Usuario
                WHERE NombreCompleto LIKE @SearchTerm
            `);
        return result.recordset as Usuario[];
    }


    // 5. Actualizar un usuario
    // Nota: El servicio se encarga de decidir si actualizar el hash o no.
    async updateUser(id: number, data: UpdateUserDTO & { PasswordHash?: string }): Promise<Usuario | null> {
        try {
            const pool = await dbPool;

            // Construir la lista de campos a actualizar
            let updateFields = [];
            if (data.NombreCompleto !== undefined) updateFields.push("NombreCompleto = @NombreCompleto");
            if (data.Email !== undefined) updateFields.push("Email = @Email");
            if (data.Rol !== undefined) updateFields.push("Rol = @Rol");
            // El hash solo se actualiza si viene en los datos (lo decide el servicio)
            if (data.PasswordHash !== undefined) updateFields.push("PasswordHash = @PasswordHash");

            // Siempre actualizamos la fecha de modificación
            updateFields.push("FechaActualizacion = GETDATE()");

            if (updateFields.length === 0) return null; // No hay nada que actualizar (excepto la fecha, pero la evitamos si no hay otros cambios)

            const result = await pool.request()
                .input('UsuarioID', sql.Int, id)
                .input('NombreCompleto', sql.NVarChar, data.NombreCompleto || null)
                .input('Email', sql.NVarChar, data.Email || null)
                .input('Rol', sql.NVarChar, data.Rol || null)
                .input('PasswordHash', sql.NVarChar, data.PasswordHash || null)
                .query(`
                    UPDATE Usuario
                    SET ${updateFields.join(', ')}
                    WHERE UsuarioID = @UsuarioID;

                    -- Devolvemos el usuario actualizado (sin password)
                    SELECT UsuarioID, NombreCompleto, Email, Rol, FechaCreacion, FechaActualizacion
                    FROM Usuario WHERE UsuarioID = @UsuarioID;
                `);

            return result.recordset[0] as Usuario || null;

        } catch (err: any) {
            console.error('Error en UsersRepository.updateUser:', err);
            if ('number' in err && err.number === 2627) {
                throw new Error('El email ya está en uso por otro usuario');
            }
            throw new Error('Error al actualizar usuario');
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, id)
            .query('DELETE FROM Usuario WHERE UsuarioID = @UsuarioID');

        // rowsAffected[0] será 1 si eliminó una fila, 0 si no encontró el ID.
        return result.rowsAffected[0] > 0;
    }


}