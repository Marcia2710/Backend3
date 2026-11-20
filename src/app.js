import express from 'express';
import cors from 'cors';
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (config.env !== 'test') {
  app.use(httpLogger);
}

// Documentación Swagger accesible en todos los entornos
setupSwagger(app);

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/deliveries', deliveriesRouter);

// Criterio de producción: restringir endpoints internos de generación de mocks y diagnóstico de logs
const restrictInProduction = (req, res, next) => {
  if (config.env === 'production') {
    logger.warning(`Intento de acceso a endpoint interno en producción: ${req.originalUrl}`);
    return res.status(403).json({
      status: 'error',
      code: 'FORBIDDEN_IN_PRODUCTION',
      message: 'Este endpoint interno está deshabilitado en el entorno de producción.'
    });
  }
  next();
};

app.use('/api/mocks', restrictInProduction, mocksRouter);
app.use('/api/logger-test', restrictInProduction, loggerRouter);

// Health Check sin exposición de datos sensibles
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.env,
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
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

export default app;

