import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

export const errorHandler = (err, req, res, next) => {
  const requestInfo = `[${req.method} ${req.originalUrl}]`;

  // 1. Errores controlados de dominio (CustomError)
  if (err.name === 'CustomError') {
    if (err.statusCode >= 500) {
      logger.error(`${requestInfo} (${err.code}) ${err.message}`);
    } else {
      logger.warning(`${requestInfo} (${err.code}) ${err.message}`);
    }

    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message
    });
  }

  // 2. Errores de formato de ID inválido en MongoDB (CastError)
  if (err.name === 'CastError') {
    const message = `El identificador '${err.value}' no tiene un formato válido.`;
    logger.warning(`${requestInfo} (INVALID_ID_FORMAT) ${message}`);

    return res.status(400).json({
      status: 'error',
      code: 'INVALID_ID_FORMAT',
      message
    });
  }

  // 3. Errores de validación nativa de Mongoose
  if (err.name === 'ValidationError') {
    logger.warning(`${requestInfo} (${ERROR_DICTIONARY.VALIDATION_ERROR.code}) ${err.message}`);

    return res.status(400).json({
      status: 'error',
      code: ERROR_DICTIONARY.VALIDATION_ERROR.code,
      message: err.message
    });
  }

  // 4. Errores inesperados del servidor (se persisten en logs/error-YYYY-MM-DD.log)
  logger.error(`${requestInfo} Error inesperado no controlado: ${err.message}\n${err.stack}`);

  return res.status(ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.statusCode).json({
    status: 'error',
    code: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.code,
    message: ERROR_DICTIONARY.INTERNAL_SERVER_ERROR.message
  });
};
