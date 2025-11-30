export interface Usuario {
    UsuarioID: number;
    NombreCompleto: string;
    Email: string;
    Rol: 'Admin' | 'Bibliotecario' | 'Lector';
}
