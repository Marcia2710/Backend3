import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env.config.js';
import usersRouter from './routes/user.routes.js';
import productsRouter from './routes/product.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(), 
    secret: config.jwtSecret 
  });
});

app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('🌱 Conectado a MongoDB exitosamente');
    app.listen(config.port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${config.port} (Modo: ${config.env})`);
    });
  })
  .catch((error) => {
    console.error('❌ Error de conexión a MongoDB:', error);
    process.exit(1);
  });
