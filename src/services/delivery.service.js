import fs from 'fs';
import { DeliveryRepository } from '../repositories/delivery.repository.js';
import { DELIVERY_STATUS, DOCUMENT_TYPES } from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

const deliveryRepository = new DeliveryRepository();

export class DeliveryService {
  async getAllDeliveries(filters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
    return await deliveryRepository.getAll({ page, limit, status: filters.status });
  }

  async getDeliveryById(id) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) throw new CustomError(ERROR_DICTIONARY.DELIVERY_NOT_FOUND);
    return delivery;
  }

  async createDelivery(data) {
    const { order, trackingCode } = data;
    if (!order || !trackingCode) {
      throw new CustomError(ERROR_DICTIONARY.VALIDATION_ERROR, 'Los campos order y trackingCode son obligatorios.');
    }
    const newDelivery = await deliveryRepository.create({
      ...data,
      status: DELIVERY_STATUS.ASSIGNED
    });
    logger.info(`Entrega creada: Tracking ${newDelivery.trackingCode}`);
    return newDelivery;
  }

  async updateDeliveryStatus(id, status) {
    if (!Object.values(DELIVERY_STATUS).includes(status)) {
      throw new CustomError(ERROR_DICTIONARY.INVALID_STATUS_TRANSITION);
    }
    const updated = await deliveryRepository.updateStatus(id, status);
    if (!updated) throw new CustomError(ERROR_DICTIONARY.DELIVERY_NOT_FOUND);
    logger.info(`Estado de entrega ${id} actualizado a ${status}`);
    return updated;
  }

  async uploadDeliveryReceipt(deliveryId, file) {
    if (!file) {
      throw new CustomError(ERROR_DICTIONARY.FILE_REQUIRED);
    }

    const delivery = await deliveryRepository.getById(deliveryId);
    if (!delivery) {
      fs.unlinkSync(file.path);
      throw new CustomError(ERROR_DICTIONARY.DELIVERY_NOT_FOUND);
    }

    const metadata = {
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/deliveries/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      documentType: DOCUMENT_TYPES.DELIVERY_RECEIPT,
      uploadedAt: new Date()
    };

    const updatedDelivery = await deliveryRepository.attachReceipt(deliveryId, metadata);
    logger.info(`Comprobante de entrega asociado a la entrega ${deliveryId}: ${file.filename}`);

    return updatedDelivery;
  }
}
