export interface Usuario {
    UsuarioID?: number;
    NombreCompleto: string;
    Email: string;
    PasswordHash?: string; // nunca se envía al cliente
    Rol: 'Admin' | 'Bibliotecario' | 'Lector';
    FechaCreacion?: string;
    FechaActualizacion?: string;
}
