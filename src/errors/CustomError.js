export class CustomError extends Error {
  constructor(errorType, customMessage = null) {
    super(customMessage || errorType.message);
    this.name = 'CustomError';
    this.code = errorType.code;
    this.statusCode = errorType.statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
