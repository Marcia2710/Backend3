import { OrderRepository } from '../repositories/order.repository.js';
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

const orderRepository = new OrderRepository();

export class OrderService {
  async getAllOrders(filters = {}) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(filters.limit) || 10));
  return await orderRepository.getAll({ page, limit, status: filters.status });
}

  async getOrderById(id) {
    const order = await orderRepository.getById(id);
    if (!order) throw new CustomError(ERROR_DICTIONARY.ORDER_NOT_FOUND);
    return order;
  }
  async createOrder(data) {
    const { user, items, totalAmount, shippingAddress, priority } = data;
    if (!user || !items || !items.length || totalAmount === undefined || !shippingAddress) {
      throw new CustomError(ERROR_DICTIONARY.VALIDATION_ERROR, 'Faltan datos obligatorios del pedido.');
    }
    if (priority && !Object.values(ORDER_PRIORITY).includes(priority)) {
      throw new CustomError(ERROR_DICTIONARY.VALIDATION_ERROR, 'La prioridad del pedido no es válida.');
    }
    const newOrder = await orderRepository.create({
      ...data,
      status: ORDER_STATUS.PENDING,
      priority: priority || ORDER_PRIORITY.MEDIUM
    });
    logger.info(`Pedido creado exitosamente: ID ${newOrder._id}`);
    return newOrder;
  }
  async updateOrderStatus(id, status) {
    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new CustomError(ERROR_DICTIONARY.INVALID_STATUS_TRANSITION);
    }
    const updated = await orderRepository.updateStatus(id, status);
    if (!updated) throw new CustomError(ERROR_DICTIONARY.ORDER_NOT_FOUND);
    logger.info(`Estado del pedido ${id} actualizado a ${status}`);
    return updated;
  }
}
