export const ERROR_DICTIONARY = Object.freeze({
  // Errores de Validación y Genéricos
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Faltan campos obligatorios o los datos enviados son inválidos.',
    statusCode: 400
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Error interno del servidor.',
    statusCode: 500
  },

  // Errores de Dominio: Usuarios
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'El usuario solicitado no fue encontrado.',
    statusCode: 404
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'El correo electrónico ya se encuentra registrado.',
    statusCode: 400
  },
  FORBIDDEN_ADMIN_CREATION: {
    code: 'FORBIDDEN_ADMIN_CREATION',
    message: 'No está permitido crear un usuario con rol administrador desde este endpoint.',
    statusCode: 403
  },

  // Errores de Dominio: Productos
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'El producto solicitado no fue encontrado.',
    statusCode: 404
  },
  DUPLICATE_PRODUCT_CODE: {
    code: 'DUPLICATE_PRODUCT_CODE',
    message: 'Ya existe un producto registrado con ese código.',
    statusCode: 400
  },
  INVALID_PRODUCT_PRICE: {
    code: 'INVALID_PRODUCT_PRICE',
    message: 'El precio del producto debe ser mayor o igual a cero.',
    statusCode: 400
  },
  MISSING_API_KEY: {
    code: 'MISSING_API_KEY',
    message: 'Falta la clave de configuración del servicio de envíos.',
    statusCode: 500
  },

  // Errores de Dominio: Mocks y Carga de Datos
  INVALID_MOCK_QTY: {
    code: 'INVALID_MOCK_QTY',
    message: 'La cantidad (qty) debe ser un número entero mayor a cero y menor o igual a 1000.',
    statusCode: 400
  },
  MOCK_SEED_ERROR: {
    code: 'MOCK_SEED_ERROR',
    message: 'Ocurrió un error al intentar insertar los datos simulados en la base de datos.',
    statusCode: 500
  },

    // Errores de Dominio: Pedidos y Entregas
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    message: 'El pedido solicitado no fue encontrado.',
    statusCode: 404
  },
  DELIVERY_NOT_FOUND: {
    code: 'DELIVERY_NOT_FOUND',
    message: 'La entrega solicitada no fue encontrada.',
    statusCode: 404
  },
  INVALID_STATUS_TRANSITION: {
    code: 'INVALID_STATUS_TRANSITION',
    message: 'El estado proporcionado no es válido para esta entidad.',
    statusCode: 400
  }

});
