import { DeliveryRepository } from '../repositories/delivery.repository.js';
import { DELIVERY_STATUS } from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

const deliveryRepository = new DeliveryRepository();

export class DeliveryService {
  async getAllDeliveries() {
    return await deliveryRepository.getAll();
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
}
