import { AuthorsRepository } from '@repositories/library/authors.repository';
import { Autor } from '@interfaces/library/library.interface';
import sql from 'mssql';

// MOCK FACTORY
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

jest.mock('mssql', () => ({ NVarChar: 'NVarChar', Int: 'Int' }));

describe('AuthorsRepository', () => {
    let repository: AuthorsRepository;

    // Recuperamos los spies
    const { _mocks } = require('@config/db.config');
    const { mockInput, mockQuery } = _mocks;

    const mockAutor: Autor = { AutorID: 1, Nombre: 'Gabo', Nacionalidad: 'COL' };

    beforeEach(() => {
        repository = new AuthorsRepository();
        jest.clearAllMocks();
    });

    test('getAll debe retornar lista', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockAutor] });
        const res = await repository.getAll();
        expect(res).toEqual([mockAutor]);
    });

    test('getById debe retornar autor', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockAutor] });
        const res = await repository.getById(1);
        expect(res).toEqual(mockAutor);
        expect(mockInput).toHaveBeenCalledWith('AutorID', sql.Int, 1);
    });

    test('searchByName busca por nombre', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockAutor] });
        await repository.searchByName('Gabo');
        expect(mockInput).toHaveBeenCalledWith('SearchTerm', sql.NVarChar, '%Gabo%');
    });

    test('create crea autor', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockAutor] });
        const res = await repository.create({ Nombre: 'Gabo' });
        expect(res).toEqual(mockAutor);
    });

    test('update actualiza autor', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockAutor] });
        const res = await repository.update(1, { Nombre: 'New' });
        expect(res).toEqual(mockAutor);
    });

    test('delete elimina autor', async () => {
        mockQuery.mockResolvedValue({ rowsAffected: [1] });
        const res = await repository.delete(1);
        expect(res).toBe(true);
    });
});