# LumenLib System  -- Backend

Backend para el sistema de biblioteca digital **LumenLib**.


## Requisitos Previos

- **Node.js** (v18 o superior recomendado)
- **npm** o **yarn**
- **SQL Server** (Corriendo en el puerto 1433)


------------------------------------------------------------------------

## Instalación

1. Clonar el repositorio:
``` bash
   git clone <URL_DEL_REPO>
```
``` bash
    cd LumenLib-System-backend
```

2. Instala las dependencias:
``` bash
   pnpm install
```
------------------------------------------------------------------------
## Configuración de Entorno
Utiliza el archivo .env.template para crear un archivo .env con las variables de entorno necesarias.

------------------------------------------------------------------------
## Levantar el proyecto en modo desarrollo

``` bash
   pnpm dev
```

El proyecto se abrirá normalmente en:

    http://localhost:4000/

Si el puerto está ocupado, Vite elegirá otro automáticamente.

------------------------------------------------------------------------

## Construir para producción

``` bash
   pnpm build
```

------------------------------------------------------------------------

## Flujo de trabajo con Git

### Ramas principales:

-   **main** → rama estable (producción)
-   **dev** → Aquí se fusionan las ramas ```feature/*``` antes de pasar a main.
-   **feature/nombre-dev** → Cada desarrollador trabaja aquí sus funciones específicas.

### Crear una nueva rama
``` bash
   git checkout dev
   git pull
   git checkout -b feature/nombre-dev
```

### Subir los cambios

``` bash
   git add .
   git commit -m "Descripción de cambios"
   git push origin feature/nombre-dev
```

------------------------------------------------------------------------
