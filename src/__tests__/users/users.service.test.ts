import { UsersService } from '@services/users/users.service';
import { UsersRepository } from '@repositories/users/users.repository';
import { Usuario } from '@interfaces/users/users.interface';
import bcrypt from 'bcrypt';

// 1. Mock del Repository
jest.mock('@repositories/users/users.repository');
const MockedRepository = UsersRepository as jest.Mock<UsersRepository>;

// 2. Mock de Bcrypt (para no hacer hashing real lento)
jest.mock('bcrypt');

describe('UsersService', () => {
    let service: UsersService;
    let repository: jest.Mocked<UsersRepository>;

    const mockUser: Usuario = {
        UsuarioID: 1,
        NombreCompleto: 'Test',
        Email: 'test@test.com',
        Rol: 'Lector',
        PasswordHash: 'oldHash'
    };

    beforeEach(() => {
        repository = new MockedRepository() as jest.Mocked<UsersRepository>;
        service = new UsersService();
        // Inyección manual del mock en la propiedad privada (casting a any necesario en tests unitarios simples)
        (service as any).repository = repository;

        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        test('Debe llamar a searchByName si hay término de búsqueda', async () => {
            await service.getAllUsers('juan');
            expect(repository.searchByName).toHaveBeenCalledWith('juan');
            expect(repository.getAll).not.toHaveBeenCalled();
        });

        test('Debe llamar a getAll si no hay término', async () => {
            await service.getAllUsers();
            expect(repository.getAll).toHaveBeenCalled();
            expect(repository.searchByName).not.toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {
        test('Debe devolver usuario si existe', async () => {
            repository.getById.mockResolvedValue(mockUser);
            const result = await service.getUserById(1);
            expect(result).toEqual(mockUser);
        });

        test('Debe lanzar error si no existe', async () => {
            repository.getById.mockResolvedValue(null);
            await expect(service.getUserById(99)).rejects.toThrow('Usuario no encontrado');
        });
    });

    describe('createUser', () => {
        test('Debe hashear password y crear usuario', async () => {
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_123');
            repository.createUser.mockResolvedValue(mockUser);

            const input = { NombreCompleto: 'A', Email: 'b', Password: '123', Rol: 'Lector' as const };

            await service.createUser(input);

            expect(bcrypt.hash).toHaveBeenCalledWith('123', 10);
            expect(repository.createUser).toHaveBeenCalledWith(expect.objectContaining({
                PasswordHash: 'hashed_123'
            }));
        });
    });

    describe('deleteUser', () => {
        test('Debe lanzar error si repository devuelve false', async () => {
            repository.deleteUser.mockResolvedValue(false);
            await expect(service.deleteUser(1)).rejects.toThrow('No se pudo eliminar');
        });

        test('Debe resolver si repository devuelve true', async () => {
            repository.deleteUser.mockResolvedValue(true);
            await expect(service.deleteUser(1)).resolves.not.toThrow();
        });
    });
});