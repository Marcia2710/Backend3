import { Router } from 'express';
import { logger } from '../config/logger.config.js';

const router = Router();

router.get('/', (req, res) => {
  logger.debug('Prueba de nivel DEBUG: detalle técnico para desarrollo');
  logger.http('Prueba de nivel HTTP: registro de solicitud web');
  logger.info('Prueba de nivel INFO: operación normal del sistema');
  logger.warning('Prueba de nivel WARNING: advertencia controlada del dominio');
  logger.error('Prueba de nivel ERROR: error operativo registrado en error.log');
  logger.fatal('Prueba de nivel FATAL: falla crítica del sistema');

  return res.status(200).json({
    status: 'success',
    message: 'Logs generados en todos los niveles (debug, http, info, warning, error, fatal). Revisa la consola y la carpeta logs/.'
  });
});

export default router;
