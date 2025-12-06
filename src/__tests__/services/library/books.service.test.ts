import { BooksService } from '@services/library/books.service';
import { BooksRepository } from '@repositories/library/books.repository';
import { Libro, CreateBookDTO, LibroCatalogo } from '@interfaces/library/library.interface';

// 1. Mock del Repository
jest.mock('@repositories/library/books.repository');
const MockedRepo = BooksRepository as jest.Mock<BooksRepository>;

describe('BooksService', () => {
    let service: BooksService;
    let repository: jest.Mocked<BooksRepository>;

    // Objeto mock completo que cumple con la interfaz 'Libro' (incluyendo ImagenURL opcional)
    const mockBookResult = {
        LibroID: 1, Titulo: 'Vue', ISBN: '123', Stock: 10,
        AnioPublicacion: 2024, AutorID: 1, CategoriaID: 1,
        ImagenURL: 'uploads/test-image.jpg' // 🚨 Nuevo campo para pruebas
    } as Libro;

    // Objeto mock para la vista de catálogo
    const mockCatalogoItem = {
        ...mockBookResult,
        NombreAutor: 'Autor Test',
        NombreCategoria: 'Cat Test'
    } as LibroCatalogo;

    // 💡 HELPER: Crea un DTO válido para satisfacer a TypeScript en los tests de creación
    const createValidInput = (overrides?: Partial<CreateBookDTO>): CreateBookDTO => ({
        Titulo: 'Test Book',
        ISBN: '000-000',
        AnioPublicacion: 2020,
        Stock: 10,
        AutorID: 1,
        CategoriaID: 1,
        ImagenURL: null, // Por defecto null
        ...overrides
    });

    beforeEach(() => {
        repository = new MockedRepo() as jest.Mocked<BooksRepository>;
        service = new BooksService();
        // Inyección del mock en la propiedad privada
        (service as any).repository = repository;
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------
    // 1. Tests de LECTURA (getCatalog, getBookById)
    // -------------------------------------------------------------------
    describe('getCatalog', () => {
        test('Debe llamar a searchByTitle si se provee término de búsqueda', async () => {
            repository.searchByTitle.mockResolvedValue([mockCatalogoItem]);

            await service.getCatalog('Vue');

            expect(repository.searchByTitle).toHaveBeenCalledWith('Vue');
            expect(repository.getAllCatalog).not.toHaveBeenCalled();
        });

        test('Debe llamar a getAllCatalog si NO hay término de búsqueda', async () => {
            repository.getAllCatalog.mockResolvedValue([mockCatalogoItem]);

            await service.getCatalog();

            expect(repository.getAllCatalog).toHaveBeenCalled();
            expect(repository.searchByTitle).not.toHaveBeenCalled();
        });
    });

    describe('getBookById', () => {
        test('Debe devolver el libro si existe', async () => {
            repository.getById.mockResolvedValue(mockBookResult);
            const result = await service.getBookById(1);
            expect(result).toEqual(mockBookResult);
        });

        test('Debe lanzar error si el libro no existe (null)', async () => {
            repository.getById.mockResolvedValue(null);
            await expect(service.getBookById(99)).rejects.toThrow('no encontrado');
        });
    });

    // -------------------------------------------------------------------
    // 2. Tests de CREACIÓN (createBook)
    // -------------------------------------------------------------------
    describe('createBook', () => {
        test('Debe lanzar error si el Stock es negativo', async () => {
            // Usamos el helper para pasar un objeto completo pero con stock inválido
            const badInput = createValidInput({ Stock: -5 });

            await expect(service.createBook(badInput)).rejects.toThrow('no puede ser negativo');
            expect(repository.createBook).not.toHaveBeenCalled();
        });

        test('Debe crear el libro exitosamente sin imagen', async () => {
            const goodInput = createValidInput({ Stock: 10 });
            repository.createBook.mockResolvedValue(mockBookResult);

            const result = await service.createBook(goodInput);

            expect(result).toEqual(mockBookResult);
            expect(repository.createBook).toHaveBeenCalledWith(goodInput);
        });

        // 🚨 TEST NUEVO PARA IMAGEN
        test('Debe pasar la ImagenURL al repositorio si se proporciona', async () => {
            const inputWithImage = createValidInput({ ImagenURL: 'uploads/foto.png' });
            repository.createBook.mockResolvedValue({ ...mockBookResult, ImagenURL: 'uploads/foto.png' });

            const result = await service.createBook(inputWithImage);

            expect(result.ImagenURL).toBe('uploads/foto.png');
            // Verificamos que el repositorio recibió el objeto con la imagen
            expect(repository.createBook).toHaveBeenCalledWith(expect.objectContaining({
                ImagenURL: 'uploads/foto.png'
            }));
        });
    });

    // -------------------------------------------------------------------
    // 3. Tests de ACTUALIZACIÓN (updateBook)
    // -------------------------------------------------------------------
    describe('updateBook', () => {
        test('Debe lanzar error si el Stock es negativo', async () => {
            await expect(service.updateBook(1, { Stock: -5 })).rejects.toThrow('negativo');
            expect(repository.updateBook).not.toHaveBeenCalled();
        });

        test('Debe lanzar error si el libro a actualizar no existe', async () => {
            repository.updateBook.mockResolvedValue(null);

            await expect(service.updateBook(1, { Stock: 5 })).rejects.toThrow('no encontrado');
        });

        test('Debe actualizar y devolver el libro si es exitoso', async () => {
            repository.updateBook.mockResolvedValue(mockBookResult);

            const result = await service.updateBook(1, { Stock: 5 });

            expect(result).toEqual(mockBookResult);
            expect(repository.updateBook).toHaveBeenCalledWith(1, { Stock: 5 });
        });

        // 🚨 TEST NUEVO PARA IMAGEN EN UPDATE
        test('Debe permitir actualizar solo la ImagenURL', async () => {
            const newImage = { ImagenURL: 'uploads/nueva.jpg' };
            repository.updateBook.mockResolvedValue({ ...mockBookResult, ...newImage });

            const result = await service.updateBook(1, newImage);

            expect(result.ImagenURL).toBe('uploads/nueva.jpg');
            expect(repository.updateBook).toHaveBeenCalledWith(1, newImage);
        });
    });

    // -------------------------------------------------------------------
    // 4. Tests de ELIMINACIÓN (deleteBook)
    // -------------------------------------------------------------------
    describe('deleteBook', () => {
        test('Debe lanzar error si el repositorio no pudo eliminar (false)', async () => {
            repository.deleteBook.mockResolvedValue(false);

            await expect(service.deleteBook(1)).rejects.toThrow('No se pudo eliminar');
        });

        test('Debe resolver exitosamente si el repositorio eliminó (true)', async () => {
            repository.deleteBook.mockResolvedValue(true);

            await expect(service.deleteBook(1)).resolves.not.toThrow();
            expect(repository.deleteBook).toHaveBeenCalledWith(1);
        });
    });
});