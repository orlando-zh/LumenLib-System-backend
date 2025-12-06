import { CategoriesService } from '@services/library/categories.service';
import { CategoriesRepository } from '@repositories/library/categories.repository';

jest.mock('@repositories/library/categories.repository');
const MockedRepo = CategoriesRepository as jest.Mock<CategoriesRepository>;

describe('CategoriesService', () => {
    let service: CategoriesService;
    let repository: jest.Mocked<CategoriesRepository>;
    const mockCat = { CategoriaID: 1, NombreCategoria: 'A' };

    beforeEach(() => {
        repository = new MockedRepo() as jest.Mocked<CategoriesRepository>;
        service = new CategoriesService();
        (service as any).repository = repository;
        jest.clearAllMocks();
    });

    test('getAllCategories rutea busqueda o todo', async () => {
        await service.getAllCategories('A');
        expect(repository.searchByName).toHaveBeenCalled();
        await service.getAllCategories();
        expect(repository.getAll).toHaveBeenCalled();
    });

    test('createCategory valida nombre', async () => {
        // @ts-ignore
        await expect(service.createCategory({ NombreCategoria: '' })).rejects.toThrow();

        repository.create.mockResolvedValue(mockCat);
        await expect(service.createCategory({ NombreCategoria: 'A' })).resolves.toEqual(mockCat);
    });

    test('updateCategory verifica existencia', async () => {
        repository.update.mockResolvedValue(null);
        await expect(service.updateCategory(1, { NombreCategoria: 'B' })).rejects.toThrow('no encontrada');

        repository.update.mockResolvedValue(mockCat);
        await expect(service.updateCategory(1, { NombreCategoria: 'B' })).resolves.toEqual(mockCat);
    });

    test('deleteCategory verifica exito', async () => {
        repository.delete.mockResolvedValue(false);
        await expect(service.deleteCategory(1)).rejects.toThrow('No se pudo eliminar');

        repository.delete.mockResolvedValue(true);
        await expect(service.deleteCategory(1)).resolves.not.toThrow();
    });
});