import mongoose from 'mongoose';
import app from './app.js';
import { config } from './config/env.config.js';
import { logger } from './config/logger.config.js';

mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info('Conexión a MongoDB establecida exitosamente');
    app.listen(config.port, () => {
      logger.info(`Servidor ShipNow escuchando en el puerto ${config.port} (Modo: ${config.env})`);
      logger.info(`Documentación Swagger disponible en http://localhost:${config.port}/api/docs`);
    });
  })
  .catch((error) => {
    logger.fatal(`Falla crítica al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  });
