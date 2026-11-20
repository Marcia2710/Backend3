import { DeliveryService } from '../services/delivery.service.js';

const deliveryService = new DeliveryService();

export class DeliveryController {
  async getAll(req, res, next) {
    try {
      const deliveries = await deliveryService.getAllDeliveries(req.query);
      return res.status(200).json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id);
      return res.status(200).json(delivery);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newDelivery = await deliveryService.createDelivery(req.body);
      return res.status(201).json(newDelivery);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const updated = await deliveryService.updateDeliveryStatus(req.params.id, req.body.status);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async uploadReceipt(req, res, next) {
    try {
      const updated = await deliveryService.uploadDeliveryReceipt(req.params.id, req.file);
      return res.status(200).json({
        status: 'success',
        message: 'Comprobante de entrega cargado correctamente',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
