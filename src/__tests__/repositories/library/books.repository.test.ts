import { BooksRepository } from '@repositories/library/books.repository';
import { Libro, LibroCatalogo } from '@interfaces/library/library.interface';
import sql from 'mssql';

jest.mock('@config/db.config', () => {

    const mockInput = jest.fn().mockReturnThis();
    const mockQuery = jest.fn();
    const mockRequest = { input: mockInput, query: mockQuery };
    const mockPool = { request: jest.fn(() => mockRequest) };

    return {
        dbPool: Promise.resolve(mockPool),
        _mocks: { mockInput, mockQuery }
    };
});

// 2. MOCK DE MSSQL
jest.mock('mssql', () => ({
    NVarChar: 'NVarChar',
    Int: 'Int',
    connect: jest.fn()
}));

describe('BooksRepository', () => {
    let repository: BooksRepository;

    // 3. RECUPERAMOS LOS SPIES
    const { _mocks } = require('@config/db.config');
    const { mockInput, mockQuery } = _mocks;

    // Datos de prueba (Incluyendo ImagenURL)
    const mockBook: Libro = {
        LibroID: 1,
        Titulo: 'Vue Mastery',
        ISBN: '978-123',
        Stock: 10,
        AutorID: 1,
        CategoriaID: 1,
        AnioPublicacion: 2024,
        ImagenURL: 'uploads/libro-vue.jpg' // 🚨 Dato nuevo
    };

    const mockCatalogo: LibroCatalogo = {
        ...mockBook,
        LibroID: 1, // Aseguramos que no sea undefined
        NombreAutor: 'Evan You',
        NombreCategoria: 'Frontend'
    };

    beforeEach(() => {
        repository = new BooksRepository();
        jest.clearAllMocks();
    });

    // --- TESTS DE LECTURA ---

    test('getAllCatalog retorna vista completa', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCatalogo] });

        const res = await repository.getAllCatalog();

        expect(res).toEqual([mockCatalogo]);
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM VistaCatalogoLibros'));
    });

    test('getById retorna libro por ID', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockBook] });

        const res = await repository.getById(1);

        expect(res).toEqual(mockBook);
        expect(mockInput).toHaveBeenCalledWith('LibroID', sql.Int, 1);
    });

    test('searchByTitle usa LIKE para buscar', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCatalogo] });

        await repository.searchByTitle('Vue');

        expect(mockInput).toHaveBeenCalledWith('SearchTerm', sql.NVarChar, '%Vue%');
    });

    // --- TESTS DE ESCRITURA ---

    test('createBook inserta libro incluyendo ImagenURL', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockBook] });

        const res = await repository.createBook(mockBook);

        expect(res).toEqual(mockBook);
        // Validamos campos clave
        expect(mockInput).toHaveBeenCalledWith('Titulo', sql.NVarChar, mockBook.Titulo);
        // 🚨 Validamos que la imagen se esté pasando al SQL
        expect(mockInput).toHaveBeenCalledWith('ImagenURL', sql.NVarChar, mockBook.ImagenURL);
    });

    test('updateBook actualiza campos parciales e imagen', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockBook] });

        const updateData = { Stock: 5, ImagenURL: 'uploads/new-cover.jpg' };
        const res = await repository.updateBook(1, updateData);

        expect(res).toEqual(mockBook);
        // Validamos que se envíen los campos actualizados
        expect(mockInput).toHaveBeenCalledWith('LibroID', sql.Int, 1);
        expect(mockInput).toHaveBeenCalledWith('Stock', sql.Int, 5);
        expect(mockInput).toHaveBeenCalledWith('ImagenURL', sql.NVarChar, 'uploads/new-cover.jpg');

        // Validamos que NO se envíen campos que no tocamos
        expect(mockInput).not.toHaveBeenCalledWith('Titulo', expect.anything(), expect.anything());
    });

    test('deleteBook elimina libro por ID', async () => {
        mockQuery.mockResolvedValue({ rowsAffected: [1] });

        const res = await repository.deleteBook(1);

        expect(res).toBe(true);
        expect(mockInput).toHaveBeenCalledWith('LibroID', sql.Int, 1);
    });
});