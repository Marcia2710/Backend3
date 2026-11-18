import { MockService } from '../services/mock.service.js';
import { ROLES } from '../constants/index.js';

const mockService = new MockService();

export class MockController {
  getUsers(req, res, next) {
    try {
      const users = mockService.generateUsers(req.query.qty);
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  getDrivers(req, res, next) {
    try {
      const drivers = mockService.generateUsers(req.query.qty, ROLES.DRIVER);
      return res.status(200).json(drivers);
    } catch (error) {
      next(error);
    }
  }

  getOrders(req, res, next) {
    try {
      const orders = mockService.generateOrders(req.query.qty);
      return res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  getDeliveries(req, res, next) {
    try {
      const orders = mockService.generateOrders(req.query.qty);
      const deliveries = mockService.generateDeliveries(orders);
      return res.status(200).json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  async seed(req, res, next) {
    try {
      const summary = await mockService.seedDatabase(req.query.qty);
      return res.status(201).json({
        mensaje: 'Datos de prueba insertados correctamente',
        insertados: summary
      });
    } catch (error) {
      next(error);
    }
  }
}
