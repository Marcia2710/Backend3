process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { expect } from 'chai';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import ProductModel from '../src/models/product.model.js';
import OrderModel from '../src/models/order.model.js';
import DeliveryModel from '../src/models/delivery.model.js';

describe('Suite de Tests Funcionales - ShipNow API', function () {
  before(async function () {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  after(async function () {
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await OrderModel.deleteMany({});
    await DeliveryModel.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Módulo de Usuarios (/api/users)', function () {
    beforeEach(async function () {
      await UserModel.deleteMany({});
    });

    it('GET /api/users debe devolver status 200 y un listado de usuarios', async function () {
      await UserModel.create({
        firstName: 'Ana',
        lastName: 'Pérez',
        email: 'ana.test@shipnow.com',
        password: 'Password123',
        role: 'user'
      });

      const res = await request(app).get('/api/users');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body[0]).to.have.property('email', 'ana.test@shipnow.com');
      expect(res.body[0]).to.not.have.property('password');
    });

    it('POST /api/users debe fallar con 400 si faltan datos obligatorios', async function () {
      const res = await request(app).post('/api/users').send({ firstName: 'SinApellido' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('code', 'VALIDATION_ERROR');
    });

    it('GET /api/users/:id debe devolver 404 con USER_NOT_FOUND si no existe', async function () {
      const res = await request(app).get('/api/users/64b000000000000000000099');
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('code', 'USER_NOT_FOUND');
    });
  });

  describe('Módulo de Pedidos (/api/orders)', function () {
    let testUser;
    let testProduct;

    beforeEach(async function () {
      await OrderModel.deleteMany({});
      await UserModel.deleteMany({});
      await ProductModel.deleteMany({});

      testUser = await UserModel.create({
        firstName: 'Carlos',
        lastName: 'Cliente',
        email: 'carlos@test.com',
        password: 'Password123',
        role: 'user'
      });

      testProduct = await ProductModel.create({
        title: 'Caja Envío',
        code: 'CAJA-001',
        price: 100,
        stock: 10
      });
    });

    it('POST /api/orders debe crear un pedido válido y devolver status 201', async function () {
      const res = await request(app).post('/api/orders').send({
        user: testUser._id.toString(),
        items: [{ product: testProduct._id.toString(), quantity: 2, price: 100 }],
        totalAmount: 200,
        shippingAddress: 'Av. Libertad 500, Merlo'
      });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('status', 'pending');
    });

    it('PATCH /api/orders/:id/status debe actualizar estado válido y rechazar inválido con 400', async function () {
      const created = await OrderModel.create({
        user: testUser._id,
        items: [{ product: testProduct._id, quantity: 1, price: 100 }],
        totalAmount: 100,
        shippingAddress: 'Calle Falsa 123'
      });

      const validRes = await request(app).patch(`/api/orders/${created._id}/status`).send({ status: 'in_transit' });
      expect(validRes.status).to.equal(200);
      expect(validRes.body).to.have.property('status', 'in_transit');

      const invalidRes = await request(app).patch(`/api/orders/${created._id}/status`).send({ status: 'inventado' });
      expect(invalidRes.status).to.equal(400);
      expect(invalidRes.body).to.have.property('code', 'INVALID_STATUS_TRANSITION');
    });
  });

  describe('Módulo de Mocks (/api/mocks)', function () {
    it('GET /api/mocks/users?qty=3 debe devolver 3 usuarios simulados', async function () {
      const res = await request(app).get('/api/mocks/users?qty=3');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(3);
    });

    it('GET /api/mocks/users?qty=-5 debe devolver 400 con INVALID_MOCK_QTY', async function () {
      const res = await request(app).get('/api/mocks/users?qty=-5');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('code', 'INVALID_MOCK_QTY');
    });
  });

  describe('Módulo de Carga de Archivos (Multer)', function () {
    let testUser;
    const createdFiles = [];

    beforeEach(async function () {
      await DeliveryModel.deleteMany({});
      await OrderModel.deleteMany({});
      await UserModel.deleteMany({});

      testUser = await UserModel.create({
        firstName: 'Lucía',
        lastName: 'Gómez',
        email: 'lucia.upload@test.com',
        password: 'Password123',
        role: 'repartidor'
      });
    });

    after(function () {
      for (const filePath of createdFiles) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    it('POST /api/users/:id/documents debe subir documento y guardar metadatos', async function () {
      const res = await request(app)
        .post(`/api/users/${testUser._id}/documents`)
        .field('documentType', 'licencia')
        .attach('document', Buffer.from('%PDF-1.4 test'), { filename: 'licencia.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(200);
      expect(res.body.data.document).to.have.property('originalName', 'licencia.pdf');
      createdFiles.push(path.join(process.cwd(), 'uploads', 'licenses', res.body.data.document.fileName));
    });

    it('POST /api/users/:id/documents debe devolver 400 con FILE_REQUIRED si falta archivo', async function () {
      const res = await request(app).post(`/api/users/${testUser._id}/documents`).field('documentType', 'dni');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('code', 'FILE_REQUIRED');
    });

    it('POST /api/deliveries/:id/receipt debe devolver 404 con DELIVERY_NOT_FOUND si no existe', async function () {
      const res = await request(app)
        .post('/api/deliveries/64b000000000000000000088/receipt')
        .attach('receipt', Buffer.from('%PDF-1.4 test'), { filename: 'remito.pdf', contentType: 'application/pdf' });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('code', 'DELIVERY_NOT_FOUND');
    });
  });

  describe('Endpoints de Sistema (Health, Logger, Swagger y 404)', function () {
    it('GET /api/health debe devolver ok sin exponer secretos', async function () {
      const res = await request(app).get('/api/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'ok');
      expect(res.body).to.not.have.property('secret');
    });

    it('GET /api/logger-test debe devolver status 200', async function () {
      const res = await request(app).get('/api/logger-test');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'success');
    });

    it('GET /api/docs/ debe cargar Swagger UI con status 200', async function () {
      const res = await request(app).get('/api/docs/');
      expect(res.status).to.equal(200);
      expect(res.text).to.include('Swagger UI');
    });

    it('GET /api/ruta-inexistente debe devolver 404 con ROUTE_NOT_FOUND', async function () {
      const res = await request(app).get('/api/ruta-inexistente');
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('code', 'ROUTE_NOT_FOUND');
    });
  });
});
