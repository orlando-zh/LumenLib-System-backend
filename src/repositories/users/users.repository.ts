import sql from 'mssql';
import { dbPool } from '@config/db.config';
import { Usuario } from '@interfaces/users/users.interface';

export class UsersRepository {

    // Obtener todos los usuarios (incluyendo PasswordHash para login)
    async getAll(): Promise<Usuario[]> {
        try {
            const pool = await dbPool;

            const result = await pool.request().query(`
                SELECT
                    UsuarioID,
                    NombreCompleto,
                    Email,
                    PasswordHash,       
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

    // Crear un nuevo usuario
    async createUser(user: Usuario): Promise<Usuario> {
        try {
            const pool = await dbPool;

            const result = await pool.request()
                .input('NombreCompleto', sql.NVarChar, user.NombreCompleto)
                .input('Email', sql.NVarChar, user.Email)
                .input('PasswordHash', sql.NVarChar, user.PasswordHash) // ya viene hash desde el servicio
                .input('Rol', sql.NVarChar, user.Rol)
                .query(`
                    INSERT INTO Usuario (NombreCompleto, Email, PasswordHash, Rol)
                        OUTPUT
                        INSERTED.UsuarioID,
                    INSERTED.NombreCompleto,
                    INSERTED.Email,
                    INSERTED.Rol,
                    INSERTED.FechaCreacion,
                    INSERTED.FechaActualizacion
                    VALUES (@NombreCompleto, @Email, @PasswordHash, @Rol)
                `);

            return result.recordset[0];
        } catch (err: any) {
            console.error('Error en UsersRepository.createUser:', err);

            // Manejo específico para email duplicado (SQL Server: error 2627)
            if ('number' in err && err.number === 2627) {
                throw new Error('El email ya está registrado');
            }

            throw new Error('Error al crear usuario en la base de datos');
        }
    }


    async getUserById(id: number): Promise<Usuario | undefined> {
        const pool = await dbPool;
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT * FROM Usuario WHERE UsuarioID = @Id');

        return result.recordset[0];
    }

    async updateUser(id: number, user: Usuario): Promise<Usuario> {
        try {
            const pool = await dbPool;

            // Nota: Se asume que el Service ya preparó el objeto 'user' con los datos correctos
            // (incluyendo el hash viejo si no se cambió la contraseña)
            const result = await pool.request()
                .input('UsuarioID', sql.Int, id)
                .input('NombreCompleto', sql.NVarChar, user.NombreCompleto)
                .input('Email', sql.NVarChar, user.Email)
                .input('PasswordHash', sql.NVarChar, user.PasswordHash)
                .input('Rol', sql.NVarChar, user.Rol)
                .query(`
                    UPDATE Usuario
                    SET 
                        NombreCompleto = @NombreCompleto,
                        Email = @Email,
                        PasswordHash = @PasswordHash,
                        Rol = @Rol,
                        FechaActualizacion = GETDATE()
                    WHERE UsuarioID = @UsuarioID;

                    -- Devolvemos el usuario actualizado (sin password)
                    SELECT UsuarioID, NombreCompleto, Email, Rol, FechaCreacion, FechaActualizacion
                    FROM Usuario WHERE UsuarioID = @UsuarioID;
                `);

            return result.recordset[0];

        } catch (err: any) {
            console.error('Error en UsersRepository.updateUser:', err);
            if ('number' in err && err.number === 2627) {
                throw new Error('El email ya está en uso por otro usuario');
            }
            throw new Error('Error al actualizar usuario');
        }
    }
}
