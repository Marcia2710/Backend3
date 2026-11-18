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




## 🛡️ Manejo Centralizado de Errores

La API utiliza una capa común para gestionar todas las fallas de forma consistente, evitando respuestas de error dispersas en rutas o controladores.

### Arquitectura de Errores
* **Diccionario de Errores (`src/errors/errorDictionary.js`):** Define los códigos internos, mensajes descriptivos y códigos de estado HTTP (`400`, `403`, `404`, `500`) para cada caso del dominio.
* **Clase `CustomError` (`src/errors/CustomError.js`):** Permite que la capa de *Services* lance excepciones tipadas del dominio sin conocer detalles de HTTP.
* **Middleware Global (`src/middlewares/errorHandler.js`):** Captura cualquier error propagado con `next(error)` (incluyendo errores de validación o formato de ID de Mongoose) y devuelve una respuesta JSON uniforme.

### Estructura de Respuesta de Error
Todos los errores responden con el siguiente formato estándar:

```json
{
  "status": "error",
  "code": "INVALID_MOCK_QTY",
  "message": "La cantidad '-5' es inválida. Debe ser un número entero entre 1 y 1000."
}
```

### Cómo probar casos inválidos
Con el servidor en ejecución (`npm run dev`), puedes verificar el comportamiento ante errores probando los siguientes endpoints:

1. **Cantidad inválida en Mocks (negativo, cero o texto):**
   * `GET http://localhost:8080/api/mocks/users?qty=-5` → Devuelve HTTP `400` con código `INVALID_MOCK_QTY`.
   * `POST http://localhost:8080/api/mocks/seed?qty=abc` → Devuelve HTTP `400` con código `INVALID_MOCK_QTY`.
2. **Formato de ID inválido en MongoDB:**
   * `GET http://localhost:8080/api/products/12345` → Devuelve HTTP `400` con código `INVALID_ID_FORMAT`.
3. **Recurso inexistente:**
   * `GET http://localhost:8080/api/users/64b000000000000000000000` → Devuelve HTTP `404` con código `USER_NOT_FOUND`.


## 📊 Sistema de Logging y Monitoreo (Winston)

La aplicación reemplaza los mensajes sueltos en consola por un sistema de logging centralizado implementado con **Winston** (`src/config/logger.config.js`) y rotación diaria mediante `winston-daily-rotate-file`.

### Niveles de Log Configurados
De mayor a menor criticidad:
1. **`fatal` (0):** Fallas críticas del sistema (ej. error inicial al conectar a MongoDB).
2. **`error` (1):** Errores inesperados del servidor o fallas al persistir datos.
3. **`warning` (2):** Advertencias controladas del negocio, rutas inexistentes o validaciones fallidas (`CustomError` 4xx).
4. **`info` (3):** Eventos relevantes del ciclo de vida (arranque del servidor, conexión a base de datos, creación de productos o carga de mocks).
5. **`http` (4):** Registro automático de todas las peticiones HTTP entrantes, su código de estado y tiempo de respuesta.
6. **`debug` (5):** Detalles técnicos internos para depuración en desarrollo.

### Comportamiento según el Entorno (`NODE_ENV`)
* **Desarrollo (`development`):** Registra y muestra por consola todos los niveles desde `debug` hasta `fatal`.
* **Producción (`production`):** Filtra los detalles técnicos y registra únicamente eventos relevantes desde `info` hasta `fatal`.

### Persistencia, Rotación y Archivos Ignorados
* **Ubicación:** Los registros se guardan automáticamente en la carpeta `logs/` en la raíz del proyecto.
* **Rotación:** Los archivos rotan diariamente (`error-YYYY-MM-DD.log` y `combined-YYYY-MM-DD.log`), con un límite de `10MB` por archivo y retención de `14 días` para evitar crecimiento descontrolado.
* **Archivo de errores:** `logs/error-YYYY-MM-DD.log` almacena exclusivamente los niveles `error` y `fatal`.
* **Control de versiones (`.gitignore`):** La carpeta `logs/` (al igual que `node_modules` y `.env`) está ignorada en Git para evitar subir registros locales al repositorio.

### Cómo probar el Endpoint del Logger
Con el servidor en ejecución (`npm run dev`), realiza una petición `GET` al endpoint de diagnóstico:

* `GET http://localhost:8080/api/logger-test`

Esto disparará un mensaje en cada uno de los 6 niveles configurados, permitiéndote verificar su salida inmediata en la consola y su persistencia en los archivos dentro de `logs/`.


## 📖 Documentación Interactiva con Swagger (`/api/docs`)

La API cuenta con documentación técnica generada con **Swagger / OpenAPI 3.0** (`src/config/swagger.config.js`), separada de la lógica de rutas y accesible de forma interactiva.

### Cómo acceder a la documentación
1. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
2. Abre en tu navegador web:
   * `http://localhost:8080/api/docs`

### Módulos y Esquemas Documentados
* **Tags agrupados por dominio:** `Users`, `Products`, `Orders`, `Deliveries`, `Mocks` y `Logger` (aclarando que `/api/logger-test` es una herramienta interna de diagnóstico).
* **Schemas reutilizables:** `User`, `Product`, `Order`, `OrderItem`, `Delivery`, `SuccessResponse` y `ErrorResponse`.
* **Aclaración para probar endpoints:** Desde la interfaz de Swagger puedes hacer clic en **"Try it out" → "Execute"** en cualquier ruta. Para probar endpoints de detalle o cambio de estado (`GET /api/users/{id}`, `PATCH /api/orders/{id}/status`, `PATCH /api/deliveries/{id}/status`), puedes generar datos previamente ejecutando `POST /api/mocks/seed` y copiar cualquiera de los `_id` devueltos por los endpoints de listado (`GET`).



## 🧪 Testing Funcional Automatizado

El proyecto cuenta con una suite de pruebas funcionales automatizadas para validar los flujos exitosos y el manejo centralizado de errores en los endpoints principales.

### Herramientas Utilizadas
* **Mocha:** Framework de ejecución y organización de suites de prueba.
* **Chai:** Librería de aserciones para validar códigos de estado HTTP, estructuras JSON y propiedades de respuesta.
* **Supertest:** Cliente HTTP para realizar peticiones contra la aplicación Express (`src/app.js`) sin necesidad de abrir un puerto manualmente.

### Cómo Ejecutar los Tests
Con las dependencias instaladas, ejecuta en la terminal:

```bash
npm test
```

### Módulos Cubiertos
* **Usuarios (`/api/users`):** Listado exitoso, error `400` por datos incompletos y `404` ante usuario inexistente.
* **Pedidos (`/api/orders`):** Creación con datos válidos, listado, consulta por ID y validación de transición de estados (`PATCH /api/orders/:id/status`).
* **Mocks (`/api/mocks`):** Generación de usuarios en memoria, inserción masiva en BD (`/seed`) y validación de cantidades inválidas (`INVALID_MOCK_QTY`).
* **Sistema (`/api/logger-test`, `/api/docs`):** Validación del endpoint de diagnóstico de Winston, acceso a la interfaz de Swagger UI y respuesta `404` ante rutas inexistentes.

### Base de Datos y Variables de Entorno de Testing
* **Base de datos separada:** Los tests utilizan una base de datos exclusiva para pruebas (ej. `shipnow_test`) con limpieza automática mediante hooks (`beforeEach` / `after`) para evitar modificar datos de desarrollo y garantizar que la suite sea repetible.
* **Variables necesarias (`.env.test`):** Crea un archivo `.env.test` en la raíz del proyecto (ignorado en Git) con las mismas claves que `.env.example`, estableciendo `NODE_ENV=test` y apuntando `MONGODB_URI` a la base de datos de pruebas.
