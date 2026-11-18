import { OrderService } from '../services/order.service.js';

const orderService = new OrderService();

export class OrderController {
  async getAll(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      return res.status(200).json(orders);
    } catch (error) { next(error); }
  }
  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return res.status(200).json(order);
    } catch (error) { next(error); }
  }
  async create(req, res, next) {
    try {
      const newOrder = await orderService.createOrder(req.body);
      return res.status(201).json(newOrder);
    } catch (error) { next(error); }
  }
  async updateStatus(req, res, next) {
    try {
      const updated = await orderService.updateOrderStatus(req.params.id, req.body.status);
      return res.status(200).json(updated);
    } catch (error) { next(error); }
  }
}
