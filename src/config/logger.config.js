import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from './env.config.js';

// 1. Definición de niveles personalizados (0 = más crítico, 5 = más detallado)
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'red bold',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
  }
};

winston.addColors(customLevels.colors);

// 2. Formato de salida con timestamp + nivel + mensaje (igual al ejemplo esperado)
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    // Limpiamos códigos de color ANSI si existieran para escribir limpio en archivo
    const cleanLevel = level.replace(/\u001b\[[0-9;]*m/g, '');
    return `${timestamp} [${cleanLevel.padEnd(7)}] ${message}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
  })
);

// 3. Transportes con rotación diaria de archivos
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error', // Captura 'error' (1) y 'fatal' (0)
  maxSize: '10m',
  maxFiles: '14d',
  format: logFormat
});

const combinedRotateTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: config.env === 'production' ? 'info' : 'debug',
  maxSize: '10m',
  maxFiles: '14d',
  format: logFormat
});

// 4. Creación del logger diferenciado por entorno
const isProduction = config.env === 'production';

export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: isProduction ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: consoleFormat
    }),
    errorRotateTransport,
    combinedRotateTransport
  ]
});
