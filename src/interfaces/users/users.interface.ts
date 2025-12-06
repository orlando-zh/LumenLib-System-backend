export interface Usuario {
    UsuarioID?: number;
    NombreCompleto: string;
    Email: string;
    PasswordHash?: string; // nunca se envía al cliente
    Rol: 'Admin' | 'Bibliotecario' | 'Lector';
    FechaCreacion?: string;
    FechaActualizacion?: string;
}




// Crear Usuario (POST)
// Necesita todos los campos excepto el ID y el hash (el hash se añade en el service/repository)
export type CreateUserDTO = Omit<Usuario, 'UsuarioID' | 'FechaCreacion' | 'FechaActualizacion' | 'PasswordHash'>;

// NOTA: Cuando creas un usuario, el servicio/controlador necesitará el campo de contraseña
// plano (Password) antes de hashearlo. Puedes definir un DTO para la entrada HTTP:
export interface CreateUserInputDTO extends CreateUserDTO {
    Password: string;
}


// DTO para Actualizar Usuario (PUT)
// No necesita el ID y todos los campos restantes son opcionales (Partial)
// Tampoco incluye las fechas de creación.
export type UpdateUserDTO = Partial<Omit<Usuario, 'UsuarioID' | 'FechaCreacion' | 'FechaActualizacion'>>;