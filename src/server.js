import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env.config.js';
import { logger } from './config/logger.config.js';
import { httpLogger } from './middlewares/httpLogger.js';
import { setupSwagger } from './config/swagger.config.js';
import usersRouter from './routes/user.routes.js';
import productsRouter from './routes/product.routes.js';
import ordersRouter from './routes/order.routes.js';
import deliveriesRouter from './routes/delivery.routes.js';
import mocksRouter from './routes/mock.routes.js';
import loggerRouter from './routes/logger.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(httpLogger);
setupSwagger(app);

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/mocks', mocksRouter);
app.use('/api/logger-test', loggerRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    secret: config.jwtSecret 
  });
});

app.use((req, res) => {
  logger.warning(`Ruta inexistente solicitada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: 'Ruta no encontrada'
  });
});

app.use(errorHandler);

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
