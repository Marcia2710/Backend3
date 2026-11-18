import dotenv from 'dotenv';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envPath });

const requiredEnv = ['PORT', 'MONGODB_URI', 'NODE_ENV', 'SHIPPING_API_KEY', 'JWT_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Error Crítico: La variable de entorno ${key} es obligatoria.`);
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT || 8080,
  mongoUri: process.env.MONGODB_URI,
  env: process.env.NODE_ENV,
  shippingApiKey: process.env.SHIPPING_API_KEY,
  jwtSecret: process.env.JWT_SECRET
};
