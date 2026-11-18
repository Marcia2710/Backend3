import swaggerUi from 'swagger-ui-express';
import { config } from './env.config.js';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ShipNow API',
    version: '1.0.0',
    description: 'API RESTful para gestión logística de usuarios, productos, pedidos, entregas, generación de mocks y monitoreo.'
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
      description: 'Servidor Local'
    }
  ],
  tags: [
    { name: 'Users', description: 'Gestión de usuarios y repartidores' },
    { name: 'Products', description: 'Catálogo y cotización de envíos de productos' },
    { name: 'Orders', description: 'Gestión de pedidos de clientes' },
    { name: 'Deliveries', description: 'Seguimiento y estados de entregas' },
    { name: 'Mocks', description: 'Generación y carga de datos de prueba' },
    { name: 'Logger', description: 'Herramienta de diagnóstico y validación de logs' }
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64b000000000000000000001' },
          firstName: { type: 'string', example: 'Ana' },
          lastName: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'ana.perez@test.com' },
          role: { type: 'string', enum: ['admin', 'user', 'repartidor'], example: 'user' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64b000000000000000000002' },
          title: { type: 'string', example: 'Auriculares Bluetooth' },
          code: { type: 'string', example: 'PROD-A1B2C3' },
          price: { type: 'number', example: 150 },
          stock: { type: 'integer', example: 25 },
          status: { type: 'string', enum: ['available', 'out_of_stock'], example: 'available' }
        }
      },
      OrderItem: {
        type: 'object',
        properties: {
          product: { type: 'string', example: '64b000000000000000000002' },
          quantity: { type: 'integer', example: 2 },
          price: { type: 'number', example: 150 }
        }
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64b000000000000000000003' },
          user: { type: 'string', example: '64b000000000000000000001' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          totalAmount: { type: 'number', example: 300 },
          status: { type: 'string', enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'], example: 'pending' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' },
          shippingAddress: { type: 'string', example: 'Av. Rivadavia 1234, Merlo' }
        }
      },
      Delivery: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '64b000000000000000000004' },
          order: { type: 'string', example: '64b000000000000000000003' },
          driver: { type: 'string', nullable: true, example: '64b000000000000000000005' },
          status: { type: 'string', enum: ['assigned', 'picked_up', 'in_route', 'delivered', 'failed'], example: 'assigned' },
          trackingCode: { type: 'string', example: 'SHP-98765432' }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string', example: 'Operación realizada correctamente' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Descripción detallada del error ocurrido.' }
        }
      }
    }
  },

    paths: {
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar todos los usuarios',
        responses: {
          200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } }
        }
      },
      post: {
        tags: ['Users'],
        summary: 'Crear un nuevo usuario',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        responses: {
          201: { description: 'Usuario creado' },
          400: { description: 'Datos inválidos o email duplicado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Prohibido crear rol admin', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Usuario encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: 'Usuario no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Listar todos los pedidos',
        responses: {
          200: { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } }
        }
      },
      post: {
        tags: ['Orders'],
        summary: 'Crear un nuevo pedido',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
        responses: {
          201: { description: 'Pedido creado' },
          400: { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Actualizar estado de un pedido',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'in_transit' } } } } } },
        responses: {
          200: { description: 'Estado actualizado' },
          400: { description: 'Estado inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/deliveries': {
      get: {
        tags: ['Deliveries'],
        summary: 'Listar todas las entregas',
        responses: {
          200: { description: 'Lista de entregas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Delivery' } } } } }
        }
      }
    },
    '/api/deliveries/{id}/status': {
      patch: {
        tags: ['Deliveries'],
        summary: 'Actualizar estado de una entrega',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'delivered' } } } } } },
        responses: {
          200: { description: 'Estado actualizado' },
          400: { description: 'Estado inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Entrega no encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/mocks/users': {
      get: {
        tags: ['Mocks'],
        summary: 'Generar usuarios simulados sin guardar en BD',
        parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', default: 5 } }],
        responses: {
          200: { description: 'Usuarios simulados generados' },
          400: { description: 'Cantidad inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/mocks/orders': {
      get: {
        tags: ['Mocks'],
        summary: 'Generar pedidos simulados sin guardar en BD',
        parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', default: 5 } }],
        responses: {
          200: { description: 'Pedidos simulados generados' },
          400: { description: 'Cantidad inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/mocks/seed': {
      post: {
        tags: ['Mocks'],
        summary: 'Insertar lote de datos simulados en MongoDB',
        parameters: [{ name: 'qty', in: 'query', schema: { type: 'integer', default: 10 } }],
        responses: {
          201: { description: 'Datos insertados correctamente' },
          400: { description: 'Cantidad inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Error al insertar en BD', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/logger-test': {
      get: {
        tags: ['Logger'],
        summary: 'Herramienta interna de validación para disparar todos los niveles de log (no es funcionalidad de negocio)',
        responses: {
          200: { description: 'Logs disparados correctamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
        }
      }
    }
  }
};

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

