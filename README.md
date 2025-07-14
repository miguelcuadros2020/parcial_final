# SPA Gestión de Eventos

## Descripción
Aplicación Single Page Application (SPA) para la gestión de eventos, con autenticación de usuarios, roles (administrador y visitante), persistencia de sesión y operaciones CRUD sobre eventos usando `json-server` como base de datos simulada.

## Estructura del proyecto
```
/app           # Carpeta para código fuente (opcional)
ejercicio.js   # Lógica principal JS
index.html     # Interfaz principal
package.json   # Configuración y dependencias
README.md      # Instrucciones
.db.json       # Base de datos simulada para json-server
```

## Instalación y ejecución
1. **Instala Node.js** si no lo tienes: https://nodejs.org/
2. Abre una terminal en la carpeta del proyecto.
3. Ejecuta:
   ```
npm install
npm start
   ```
   Esto iniciará `json-server` en http://localhost:3000
4. Abre `index.html` en tu navegador (puedes hacer doble clic o usar Live Server de VS Code).

## Uso
- Regístrate como visitante o administrador.
- Inicia sesión.
- Los administradores pueden crear, editar y eliminar eventos.
- Los visitantes pueden ver eventos y registrarse si hay cupo.
- La sesión persiste entre recargas.

## Notas
- El usuario administrador por defecto es:
  - Usuario: `admin`
  - Contraseña: `admin123`
- Puedes modificar `db.json` para agregar más usuarios o eventos.

## Requisitos
- Node.js
- Navegador web moderno

## Scripts útiles
- `npm start`: Inicia el servidor json-server.

## Contacto
Incluye tu nombre, clan y documento en este archivo si lo requieres para la entrega.
