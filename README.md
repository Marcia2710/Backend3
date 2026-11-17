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


## 🧪 Módulo de Mocking y Carga de Datos (`/api/mocks`)

El proyecto incluye un sistema de generación de datos simulados construido con `@faker-js/faker`, respetando la arquitectura por capas (**Controller → Service → Repository**) y utilizando los diccionarios de constantes inmutables (`ROLES`, `ORDER_STATUS`, `ORDER_PRIORITY`, `DELIVERY_STATUS`).

### Datos que se pueden generar
* **Usuarios y Repartidores:** Nombres, correos y contraseñas simuladas con roles coherentes (`user` o `repartidor`).
* **Productos:** Artículos con código único, precio, stock y estado automático (`available` u `out_of_stock`).
* **Pedidos:** Órdenes vinculadas a clientes y productos válidos, con cálculo de totales, estados (`pending`, `confirmed`, `in_transit`, `delivered`, `cancelled`) y prioridades (`low`, `medium`, `high`, `urgent`).
* **Entregas:** Envíos asociados a pedidos existentes con código de seguimiento y asignación coherente de repartidores según el estado del pedido.

### Endpoints de Mocking

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/mocks/users?qty=5` | Genera usuarios simulados (clientes y repartidores) sin guardar en BD |
| GET | `/api/mocks/drivers?qty=5` | Genera exclusivamente repartidores simulados sin guardar en BD |
| GET | `/api/mocks/orders?qty=5` | Genera pedidos simulados asociados a clientes y productos |
| GET | `/api/mocks/deliveries?qty=5` | Genera entregas simuladas vinculadas a pedidos y repartidores |
| POST | `/api/mocks/seed?qty=10` | Genera e inserta lotes de usuarios, productos, pedidos y entregas en MongoDB |

### Cómo probar la carga de datos de prueba
1. Con el servidor corriendo (`npm run dev`), ejecuta una petición `POST` a `/api/mocks/seed` indicando la cantidad deseada en el parámetro `qty`:
   ```bash
   curl -X POST "http://localhost:8080/api/mocks/seed?qty=10"
   ```
2. Verifica que los registros fueron persistidos consultando `GET http://localhost:8080/api/users` o `GET http://localhost:8080/api/products`.
