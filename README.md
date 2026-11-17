# ShipNow API — Arquitectura por Capas

Refactorización de la API base de **ShipNow** hacia una arquitectura modular en 3 capas (**Controller → Service → Repository**), incorporando configuración de entorno validada al arranque y diccionarios de constantes inmutables.

## Requisitos

- Node.js 18+
- MongoDB en local o remoto (Atlas)

## Instalación y Configuración Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto tomando como base el archivo `.env.example` y completa las claves requeridas:
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/shipnow
   NODE_ENV=development
   SHIPPING_API_KEY=tu_api_key
   JWT_SECRET=tu_clave_secreta
   ```
   *(Nota: Si falta alguna de estas variables críticas, la aplicación detendrá su ejecución al arrancar informando el error).*

3. **Ejecutar el proyecto:**
   ```bash
   npm run dev
   ```

## Decisiones de Arquitectura: Separación entre Service y Repository

Para desacoplar el código y respetar el principio de responsabilidad única, se dividió la lógica de la siguiente manera:

* **Repository (Acceso a Datos):** Es la única capa que interactúa directamente con Mongoose/MongoDB. Para evitar repositorios meramente "pasamanos", se encapsularon filtros y proyecciones por defecto en las consultas (por ejemplo, traer solo productos disponibles con stock en `getAllAvailable()` o excluir contraseñas mediante `.select('-password')` al consultar usuarios).
* **Service (Lógica de Negocio):** Concentra las reglas del dominio, cálculos y validaciones previas a la base de datos. Aquí se alojan procesos como el cálculo del costo de envío según el entorno, la notificación simulada por email al crear productos, la asignación automática de estados según el stock y la validación de seguridad que bloquea la creación de usuarios con rol `admin` en el registro público.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET/POST | `/api/users` | Listar / crear usuarios |
| GET/PUT/DELETE | `/api/users/:id` | Obtener / actualizar / eliminar |
| GET | `/api/products` | Listar productos con stock (`?all=true` incluye sin stock) |
| POST | `/api/products` | Crear producto |
| GET/PUT/DELETE | `/api/products/:id` | Obtener / actualizar / eliminar |
| GET | `/api/products/:id/shipping-cost` | Cotizar el envío de un producto |

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |
