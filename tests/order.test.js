import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import ProductModel from '../src/models/product.model.js';
import OrderModel from '../src/models/order.model.js';

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
    const payload = {
      user: testUser._id.toString(),
      items: [{ product: testProduct._id.toString(), quantity: 2, price: 100 }],
      totalAmount: 200,
      shippingAddress: 'Av. Libertad 500, Merlo'
    };

    const res = await request(app).post('/api/orders').send(payload);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    expect(res.body).to.have.property('status', 'pending');
    expect(res.body).to.have.property('totalAmount', 200);
  });

  it('GET /api/orders y GET /api/orders/:id deben listar y consultar un pedido existente', async function () {
    const created = await OrderModel.create({
      user: testUser._id,
      items: [{ product: testProduct._id, quantity: 1, price: 100 }],
      totalAmount: 100,
      shippingAddress: 'Calle Falsa 123'
    });

    const listRes = await request(app).get('/api/orders');
    expect(listRes.status).to.equal(200);
    expect(listRes.body).to.be.an('array').with.lengthOf(1);

    const detailRes = await request(app).get(`/api/orders/${created._id}`);
    expect(detailRes.status).to.equal(200);
    expect(detailRes.body).to.have.property('_id', created._id.toString());
  });

  it('PATCH /api/orders/:id/status debe actualizar un estado válido y fallar con 400 ante estado inválido', async function () {
    const created = await OrderModel.create({
      user: testUser._id,
      items: [{ product: testProduct._id, quantity: 1, price: 100 }],
      totalAmount: 100,
      shippingAddress: 'Calle Falsa 123'
    });

    const validRes = await request(app)
      .patch(`/api/orders/${created._id}/status`)
      .send({ status: 'in_transit' });
    expect(validRes.status).to.equal(200);
    expect(validRes.body).to.have.property('status', 'in_transit');

    const invalidRes = await request(app)
      .patch(`/api/orders/${created._id}/status`)
      .send({ status: 'estado_inventado' });
    expect(invalidRes.status).to.equal(400);
    expect(invalidRes.body).to.have.property('code', 'INVALID_STATUS_TRANSITION');
  });

  it('POST /api/orders debe devolver 400 si faltan datos obligatorios', async function () {
    const res = await request(app).post('/api/orders').send({ totalAmount: 50 });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('code', 'VALIDATION_ERROR');
  });
});
