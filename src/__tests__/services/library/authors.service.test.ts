import { AuthorsService } from '@services/library/authors.service';
import { AuthorsRepository } from '@repositories/library/authors.repository';
import { Autor } from '@interfaces/library/library.interface';

jest.mock('@repositories/library/authors.repository');
const MockedRepo = AuthorsRepository as jest.Mock<AuthorsRepository>;

describe('AuthorsService', () => {
    let service: AuthorsService;
    let repository: jest.Mocked<AuthorsRepository>;
    const mockAutor: Autor = { AutorID: 1, Nombre: 'Test', Nacionalidad: 'Test' };

    beforeEach(() => {
        repository = new MockedRepo() as jest.Mocked<AuthorsRepository>;
        service = new AuthorsService();
        (service as any).repository = repository;
        jest.clearAllMocks();
    });

    test('getAllAuthors debe decidir entre buscar o traer todos', async () => {
        await service.getAllAuthors('Juan');
        expect(repository.searchByName).toHaveBeenCalledWith('Juan');

        await service.getAllAuthors();
        expect(repository.getAll).toHaveBeenCalled();
    });

    test('getAuthorById debe lanzar error si no existe', async () => {
        repository.getById.mockResolvedValue(null);
        await expect(service.getAuthorById(99)).rejects.toThrow('no encontrado');
    });

    test('createAuthor valida nombre obligatorio', async () => {
        // @ts-ignore - forzamos error de tipos para probar validación
        await expect(service.createAuthor({ Nombre: '' })).rejects.toThrow('obligatorio');
        expect(repository.create).not.toHaveBeenCalled();
    });

    test('createAuthor llama al repo si es válido', async () => {
        repository.create.mockResolvedValue(mockAutor);
        const result = await service.createAuthor({ Nombre: 'Test' });
        expect(result).toEqual(mockAutor);
    });

    test('updateAuthor lanza error si el autor no existe', async () => {
        repository.update.mockResolvedValue(null); // Repo devuelve null si no actualizó
        await expect(service.updateAuthor(99, { Nombre: 'X' })).rejects.toThrow('no encontrado');
    });

    test('updateAuthor actualiza correctamente', async () => {
        repository.update.mockResolvedValue(mockAutor);
        const result = await service.updateAuthor(1, { Nombre: 'X' });
        expect(result).toEqual(mockAutor);
    });

    test('deleteAuthor lanza error si no pudo eliminar', async () => {
        repository.delete.mockResolvedValue(false);
        await expect(service.deleteAuthor(99)).rejects.toThrow('No se pudo eliminar');
    });

    test('deleteAuthor elimina correctamente', async () => {
        repository.delete.mockResolvedValue(true);
        await expect(service.deleteAuthor(1)).resolves.not.toThrow();
    });
});