import { CategoriesRepository } from '@repositories/library/categories.repository';
import { Categoria } from '@interfaces/library/library.interface';
import sql from 'mssql';

// 1. MOCK FACTORY (Corrección: Definir todo DENTRO de la función)
jest.mock('@config/db.config', () => {
    // Definimos los spies AQUÍ ADENTRO para evitar el error de inicialización
    const mockInput = jest.fn().mockReturnThis();
    const mockQuery = jest.fn();
    const mockRequest = { input: mockInput, query: mockQuery };
    const mockPool = { request: jest.fn(() => mockRequest) };

    return {
        dbPool: Promise.resolve(mockPool),
        // Exportamos los spies ocultos para usarlos en los tests
        _mocks: { mockInput, mockQuery }
    };
});

// 2. MOCK DE TIPOS MSSQL
jest.mock('mssql', () => ({
    NVarChar: 'NVarChar',
    Int: 'Int'
}));

describe('CategoriesRepository', () => {
    let repository: CategoriesRepository;

    // 3. RECUPERAMOS LOS SPIES DEL MOCK
    // Usamos require para obtener la referencia a los objetos creados arriba
    const { _mocks } = require('@config/db.config');
    const { mockInput, mockQuery } = _mocks;

    const mockCat: Categoria = { CategoriaID: 1, NombreCategoria: 'Ficcion' };

    beforeEach(() => {
        repository = new CategoriesRepository();
        jest.clearAllMocks();
    });

    test('getAll retorna categorias', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCat] });

        const res = await repository.getAll();

        expect(res).toEqual([mockCat]);
        expect(mockQuery).toHaveBeenCalled();
    });

    test('getById retorna categoria', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCat] });

        const res = await repository.getById(1);

        expect(res).toEqual(mockCat);
        expect(mockInput).toHaveBeenCalledWith('CategoriaID', sql.Int, 1);
    });

    test('searchByName busca por nombre', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCat] });

        await repository.searchByName('Fic');

        expect(mockInput).toHaveBeenCalledWith('SearchTerm', sql.NVarChar, '%Fic%');
    });

    test('create inserta categoria', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCat] });

        const res = await repository.create({ NombreCategoria: 'Ficcion' });

        expect(res).toEqual(mockCat);
        expect(mockInput).toHaveBeenCalledWith('NombreCategoria', sql.NVarChar, 'Ficcion');
    });

    test('update actualiza categoria', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockCat] });

        const res = await repository.update(1, { NombreCategoria: 'New' });

        expect(res).toEqual(mockCat);
        // Validamos que se pase el ID y el nuevo nombre
        expect(mockInput).toHaveBeenCalledWith('CategoriaID', sql.Int, 1);
        expect(mockInput).toHaveBeenCalledWith('NombreCategoria', sql.NVarChar, 'New');
    });

    test('delete elimina categoria', async () => {
        mockQuery.mockResolvedValue({ rowsAffected: [1] });

        const res = await repository.delete(1);

        expect(res).toBe(true);
        expect(mockInput).toHaveBeenCalledWith('CategoriaID', sql.Int, 1);
    });
});