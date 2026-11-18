import mongoose from 'mongoose';
import { fakerES as faker } from '@faker-js/faker';
import { MockRepository } from '../repositories/mock.repository.js';
import {
  ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS
} from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

const mockRepository = new MockRepository();

export class MockService {
  #validateQty(rawQty, defaultQty = 5) {
    if (rawQty === undefined) return defaultQty;

    const parsed = Number(rawQty);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 1000) {
      throw new CustomError(
        ERROR_DICTIONARY.INVALID_MOCK_QTY,
        `La cantidad '${rawQty}' es inválida. Debe ser un número entero entre 1 y 1000.`
      );
    }
    return parsed;
  }

  generateUsers(rawQty = 5, specificRole = null) {
    const qty = this.#validateQty(rawQty, 5);
    logger.debug(`Generando ${qty} usuarios simulados en memoria`);
    const users = [];
    const availableRoles = [ROLES.USER, ROLES.DRIVER];

    for (let i = 0; i < qty; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const role = specificRole || faker.helpers.arrayElement(availableRoles);

      users.push({
        _id: new mongoose.Types.ObjectId(),
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: faker.internet.password({ length: 10 }),
        role,
        documents: []
      });
    }
    return users;
  }

  generateProducts(rawQty = 5) {
    const qty = this.#validateQty(rawQty, 5);
    logger.debug(`Generando ${qty} productos simulados en memoria`);
    const products = [];

    for (let i = 0; i < qty; i++) {
      const stock = faker.number.int({ min: 0, max: 100 });
      products.push({
        _id: new mongoose.Types.ObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: `PROD-${faker.string.alphanumeric(6).toUpperCase()}`,
        price: Number(faker.commerce.price({ min: 10, max: 500 })),
        stock,
        category: faker.commerce.department().toLowerCase(),
        status: stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK
      });
    }
    return products;
  }

  generateOrders(rawQty = 5, usersList = [], productsList = []) {
    const qty = this.#validateQty(rawQty, 5);
    logger.debug(`Generando ${qty} pedidos simulados en memoria`);
    const clients = usersList.filter((u) => u.role === ROLES.USER);
    const validClients = clients.length > 0 ? clients : this.generateUsers(3, ROLES.USER);
    const validProducts = productsList.length > 0 ? productsList : this.generateProducts(5);

    const orders = [];
    const statuses = Object.values(ORDER_STATUS);
    const priorities = Object.values(ORDER_PRIORITY);

    for (let i = 0; i < qty; i++) {
      const client = faker.helpers.arrayElement(validClients);
      const product = faker.helpers.arrayElement(validProducts);
      const quantity = faker.number.int({ min: 1, max: 4 });
      const totalAmount = Number((product.price * quantity).toFixed(2));

      orders.push({
        _id: new mongoose.Types.ObjectId(),
        user: client._id,
        items: [{ product: product._id, quantity, price: product.price }],
        totalAmount,
        status: faker.helpers.arrayElement(statuses),
        priority: faker.helpers.arrayElement(priorities),
        shippingAddress: `${faker.location.streetAddress()}, ${faker.location.city()}`
      });
    }
    return orders;
  }

  generateDeliveries(ordersList = [], usersList = []) {
    logger.debug(`Generando ${ordersList.length} entregas simuladas en memoria`);
    const drivers = usersList.filter((u) => u.role === ROLES.DRIVER);
    const validDrivers = drivers.length > 0 ? drivers : this.generateUsers(2, ROLES.DRIVER);
    const statuses = Object.values(DELIVERY_STATUS);

    return ordersList.map((order) => {
      const needsDriver = ![ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED].includes(order.status);
      const assignedDriver = needsDriver ? faker.helpers.arrayElement(validDrivers)._id : null;

      return {
        _id: new mongoose.Types.ObjectId(),
        order: order._id,
        driver: assignedDriver,
        status: needsDriver ? faker.helpers.arrayElement(statuses) : DELIVERY_STATUS.ASSIGNED,
        trackingCode: `SHP-${faker.string.alphanumeric(8).toUpperCase()}`,
        estimatedDelivery: faker.date.soon({ days: 5 })
      };
    });
  }

  async seedDatabase(rawQty = 10) {
    const qty = this.#validateQty(rawQty, 10);
    logger.info(`Iniciando generación y carga de ${qty} registros de prueba en MongoDB...`);

    const users = this.generateUsers(qty);
    const products = this.generateProducts(qty);
    const orders = this.generateOrders(qty, users, products);
    const deliveries = this.generateDeliveries(orders, users);

    try {
      const insertedUsers = await mockRepository.insertUsers(users);
      const insertedProducts = await mockRepository.insertProducts(products);
      const insertedOrders = await mockRepository.insertOrders(orders);
      const insertedDeliveries = await mockRepository.insertDeliveries(deliveries);

      logger.info(`Carga de datos mock finalizada: ${qty} usuarios, productos, pedidos y entregas insertados.`);

      return {
        usuarios: insertedUsers.length,
        productos: insertedProducts.length,
        pedidos: insertedOrders.length,
        entregas: insertedDeliveries.length
      };
    } catch (dbError) {
      throw new CustomError(
        ERROR_DICTIONARY.MOCK_SEED_ERROR,
        `Falla al guardar los datos simulados en MongoDB: ${dbError.message}`
      );
    }
  }
}
