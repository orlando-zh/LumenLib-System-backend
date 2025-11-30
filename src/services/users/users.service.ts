import { UsersRepository } from '@repositories/users/users.repository';
import { Usuario } from '@interfaces/users/users.interface';

export class UsersService {
    private repository = new UsersRepository();

    async getAllUsers(): Promise<Usuario[]> {
        return this.repository.getAll();
    }
}
