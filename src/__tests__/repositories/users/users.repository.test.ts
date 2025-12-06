import { UsersRepository } from '@repositories/users/users.repository';
import { Usuario } from '@interfaces/users/users.interface';
import sql from 'mssql';

// 1. MOCK FACTORY PARA DB CONFIG
// Esto intenta evitar que el archivo real se ejecute
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

// 2. MOCK FACTORY PARA MSSQL (EL SALVAVIDAS 🛟)
// Agregamos 'connect' para que si db.config.ts llega a ejecutarse, no explote con "undefined.then"
jest.mock('mssql', () => ({
    NVarChar: 'NVarChar',
    Int: 'Int',
    // Esto es lo que faltaba: simular connect para que devuelva una promesa vacía
    connect: jest.fn().mockResolvedValue({
        request: jest.fn().mockReturnThis(),
        close: jest.fn()
    })
}));

describe('UsersRepository', () => {
    let repository: UsersRepository;

    // Recuperamos los spies
    const { _mocks } = require('@config/db.config');
    const { mockInput, mockQuery } = _mocks;

    const mockUser: Usuario = {
        UsuarioID: 1,
        NombreCompleto: 'Test User',
        Email: 'test@mail.com',
        Rol: 'Lector',
        PasswordHash: 'hash',
        FechaCreacion: '2025-01-01',
        FechaActualizacion: '2025-01-01'
    };

    beforeEach(() => {
        repository = new UsersRepository();
        jest.clearAllMocks();
    });

    // --- PRUEBAS ---

    test('getAll retorna usuarios', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockUser] });
        const res = await repository.getAll();
        expect(res).toEqual([mockUser]);
    });

    test('getById retorna usuario', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockUser] });
        const res = await repository.getById(1);
        expect(res).toEqual(mockUser);
        expect(mockInput).toHaveBeenCalledWith('UsuarioID', sql.Int, 1);
    });

    test('searchByName busca por nombre', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockUser] });
        await repository.searchByName('Test');
        expect(mockInput).toHaveBeenCalledWith('SearchTerm', sql.NVarChar, '%Test%');
    });

    test('createUser crea usuario', async () => {
        mockQuery.mockResolvedValue({ recordset: [mockUser] });
        const createDto = {
            NombreCompleto: 'Test',
            Email: 't@t.com',
            PasswordHash: 'hash',
            Rol: 'Lector' as const
        };
        const res = await repository.createUser(createDto);
        expect(res).toEqual(mockUser);
    });

    test('createUser lanza error si email duplicado', async () => {
        const sqlError: any = new Error('Duplicated');
        sqlError.number = 2627;
        mockQuery.mockRejectedValue(sqlError);

        const createDto = {
            NombreCompleto: 'Test',
            Email: 'dup@t.com',
            PasswordHash: 'hash',
            Rol: 'Lector' as const
        };

        await expect(repository.createUser(createDto)).rejects.toThrow('El email ya está registrado');
    });

    test('deleteUser elimina usuario', async () => {
        mockQuery.mockResolvedValue({ rowsAffected: [1] });
        const res = await repository.deleteUser(1);
        expect(res).toBe(true);
    });
});