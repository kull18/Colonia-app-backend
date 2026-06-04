# ColoniaApp API

Base URL: `http://localhost:3000`

Rutas montadas en: [src/index.ts](src/index.ts)

**Autenticación** (`/api/auth`)

- **POST /api/auth/register**: Registrar nuevo usuario (role: `admin` | `vecino`).
  - Body: `RegisterDto` { nombre, apellido, email, password, role }
  - Respuesta: `AuthResponseDto` (token + user)

- **POST /api/auth/login**: Iniciar sesión.
  - Body: `LoginDto` { email, password }
  - Respuesta: `AuthResponseDto` (token + user)

- **GET /api/auth/me**: Obtener datos del usuario autenticado.
  - Requiere header `Authorization: Bearer <token>`
  - Respuesta: objeto `user`

**Colonias** (`/api/colonias`) — todas las rutas requieren autenticación

- **POST /api/colonias/** (admin): Crear colonia.
  - Requiere role `admin`.
  - Multipart/form-data opcional: campo `imagen` (archivo) o enviar `imagenUrl` en el body.
  - Body: `CreateColoniaDto` { nombre, descripcion?, direccion?, municipio?, estadoRep?, imagenUrl? }
  - Respuesta: colonia creada (201)

- **GET /api/colonias/mis-colonias** (admin): Listar colonias del admin.
  - Requiere role `admin`.
  - Respuesta: array de colonias

- **POST /api/colonias/unirse** (vecino): Solicitar unirse a una colonia con código.
  - Requiere role `vecino`.
  - Body: `SolicitarUnirseDto` { codigoAcceso, numeroCasa? }
  - Respuesta: solicitud creada (201)

- **GET /api/colonias/:id**: Obtener detalle de una colonia por id.
  - Respuesta: objeto colonia

- **PUT /api/colonias/:id** (admin): Actualizar colonia.
  - Requiere role `admin`.
  - Multipart/form-data opcional: campo `imagen` o `imagenUrl` en el body.
  - Body: `UpdateColoniaDto` { nombre?, descripcion?, direccion?, municipio?, estadoRep?, imagenUrl? }
  - Respuesta: colonia actualizada

- **DELETE /api/colonias/:id** (admin): Desactivar (eliminar) colonia.
  - Requiere role `admin`.
  - Respuesta: 204 No Content

- **GET /api/colonias/:id/vecinos** (admin): Listar vecinos de la colonia.
  - Requiere role `admin`.
  - Query opcional: `?estado=pendiente|aprobado|rechazado|bloqueado`
  - Respuesta: array de vecinos

- **PUT /api/colonias/:id/vecinos/:userId** (admin): Actualizar estado de un vecino.
  - Requiere role `admin`.
  - Body: `UpdateVecinoEstadoDto` { estado: 'aprobado' | 'rechazado' | 'bloqueado' }
  - Respuesta: vecino actualizado

--

DTOs relevantes:
- `RegisterDto`, `LoginDto`, `AuthResponseDto`: [src/application/dtos/auth.dto.ts](src/application/dtos/auth.dto.ts)
- `CreateColoniaDto`, `UpdateColoniaDto`, `SolicitarUnirseDto`, `UpdateVecinoEstadoDto`: [src/application/dtos/colonia.dto.ts](src/application/dtos/colonia.dto.ts)

Notas:
- Endpoints protegidos requieren `Authorization: Bearer <token>`.
- Las rutas de colonias se montan en `/api/colonias` y usan middleware de roles.
