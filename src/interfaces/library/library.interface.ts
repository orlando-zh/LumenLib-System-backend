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
}

export interface Autor {
    AutorID?: number;
    Nombre: string;
    Nacionalidad?: string;
}


// Interfaces de VISTAS (Lectura optimizada)
export interface LibroCatalogo {
    LibroID: number;
    Titulo: string;
    ISBN: string;
    AnioPublicacion: number;
    Stock: number;
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
    Rol: string;
    TotalLibrosPrestados: number;
}

export interface CategoriaStat {
    NombreCategoria: string;
    CantidadLibros: number;
}

export interface AutorTop {
    Nombre: string;
    TotalLibros: number;
}