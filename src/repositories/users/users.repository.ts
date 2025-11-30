import { dbPool } from '@config/db.config';
import { Usuario } from '@interfaces/users/users.interface';

export class UsersRepository {
    async getAll(): Promise<Usuario[]> {
        try {
            const pool = await dbPool;
            const result = await pool.request().query(
                'SELECT UsuarioID, NombreCompleto, Email, Rol FROM Usuario'
            );
            return result.recordset;
        } catch (err) {
            console.error('Error en UsersRepository.getAll:', err);
            throw err;
        }
    }
}
