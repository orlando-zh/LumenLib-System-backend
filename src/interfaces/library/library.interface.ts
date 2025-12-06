// Aquí mapeamos lo que devuelve SQL (Vistas) y lo que espera (Tablas).

// Entidades Base (Para Inserts/Updates)
export interface Libro {
    LibroID?: number;
    Titulo: string;
    ISBN: string;
    AnioPublicacion: number;
    Stock: number;
    AutorID: number;
    CategoriaID: number;
    ImagenURL?: string | null;
}

export interface Autor {
    AutorID?: number;
    Nombre: string;
    Nacionalidad?: string;
}

export interface Categoria {
    CategoriaID?: number; // Opcional para Create, requerido para Update
    NombreCategoria: string;
}


// ====================================================
// 2. DATA TRANSFER OBJECTS (DTOs)
// ====================================================
// Usados para tipar el cuerpo (body) de las peticiones POST y PUT.

// --- DTOs para Libros ---
export type CreateBookDTO = Omit<Libro, 'LibroID'>; // Excluye LibroID
export type UpdateBookDTO = Partial<CreateBookDTO>; // Permite actualizar cualquier campo, excluyendo el ID

// --- DTOs para Autores ---
export type CreateAuthorDTO = Omit<Autor, 'AutorID'>; // Excluye AutorID
export type UpdateAuthorDTO = Partial<CreateAuthorDTO>; // Permite actualizar Nombre o Nacionalidad

// --- DTOs para Categorías ---
export type CreateCategoryDTO = Omit<Categoria, 'CategoriaID'>; // Excluye CategoriaID
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>; // Permite actualizar NombreCategoria


// Interfaces de VISTAS (Lectura optimizada)
export interface LibroCatalogo {
    LibroID: number;
    Titulo: string;
    ISBN: string;
    AnioPublicacion: number;
    Stock: number;
    ImagenURL?: string | null;
    NombreAutor: string;     // Viene del Alias de la Vista
    NombreCategoria: string; // Viene del Alias de la Vista
}

export interface PrestamoActivo {
    PrestamoID: number;
    Usuario: string;
    Libro: string;
    FechaPrestamo: Date;
    DiasPrestado: number;
}

export interface TopLector {
    UsuarioID: number;
    NombreCompleto: string;
    Email: string;
    TotalLibrosPrestados: number;
}

export interface HistorialPersonal {
    Titulo: string;
    ISBN: string;
    FechaPrestamo: Date;
    FechaDevolucion: Date | null;
    Estado: 'Activo' | 'Devuelto';
    DiasTranscurridos: number | null;
}


export interface CategoriaStat {
    NombreCategoria: string;
    CantidadLibros: number;
}

export interface AutorTop {
    Nombre: string;
    TotalLibros: number;
}