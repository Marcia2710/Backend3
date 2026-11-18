import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';

export const errorHandler = (err, req, res, next) => {
  // 1. Si es un error controlado lanzado por nosotros (CustomError)
  if (err.name === 'CustomError') {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message
    });
  }

  // 2. Si es un error de formato de ID inválido en MongoDB (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_ID_FORMAT',
      message: `El identificador '${err.value}' no tiene un formato válido.`
    });
  }

  // 3. Si es un error de validación nativa de Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: ERROR_DICTIONARY.VALIDATION_ERROR.code,
      message: err.message
    });
  }

  // 4. Cualquier otro error inesperado del servidor
  console.error('❌ Error no controlado:', err);
  return res.status(ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode).json({
    status: 'error',
    code: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
    message: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.message
  });
};
