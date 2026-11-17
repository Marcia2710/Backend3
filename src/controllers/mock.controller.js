import { MockService } from '../services/mock.service.js';
import { ROLES } from '../constants/index.js';

const mockService = new MockService();

export class MockController {
  getUsers(req, res) {
    const qty = Number(req.query.qty) || 5;
    const users = mockService.generateUsers(qty);
    return res.status(200).json(users);
  }

  getDrivers(req, res) {
    const qty = Number(req.query.qty) || 5;
    const drivers = mockService.generateUsers(qty, ROLES.DRIVER);
    return res.status(200).json(drivers);
  }

  getOrders(req, res) {
    const qty = Number(req.query.qty) || 5;
    const orders = mockService.generateOrders(qty);
    return res.status(200).json(orders);
  }

  getDeliveries(req, res) {
    const qty = Number(req.query.qty) || 5;
    const orders = mockService.generateOrders(qty);
    const deliveries = mockService.generateDeliveries(orders);
    return res.status(200).json(deliveries);
  }

  async seed(req, res) {
    try {
      const qty = Number(req.query.qty) || 10;
      const summary = await mockService.seedDatabase(qty);
      return res.status(201).json({
        mensaje: 'Datos de prueba insertados correctamente',
        insertados: summary
      });
    } catch (error) {
      return res.status(500).json({
        mensaje: 'Error al insertar datos de prueba',
        error: error.message
      });
    }
  }
}
