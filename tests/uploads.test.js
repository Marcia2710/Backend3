import { expect } from 'chai';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';
import OrderModel from '../src/models/order.model.js';
import DeliveryModel from '../src/models/delivery.model.js';

describe('Módulo de Carga de Archivos (Multer)', function () {
  let testUser;
  let testDelivery;
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

    const testOrder = await OrderModel.create({
      user: testUser._id,
      items: [],
      totalAmount: 150,
      shippingAddress: 'Av. San Martín 100'
    });

    testDelivery = await DeliveryModel.create({
      order: testOrder._id,
      driver: testUser._id,
      trackingCode: 'SHP-UPLOAD01'
    });
  });

  after(function () {
    // Limpiar archivos físicos generados durante los tests
    for (const filePath of createdFiles) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  it('POST /api/users/:id/documents debe subir un documento válido y guardar sus metadatos', async function () {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 contenido de prueba');

    const res = await request(app)
      .post(`/api/users/${testUser._id}/documents`)
      .field('documentType', 'licencia')
      .attach('document', fakePdfBuffer, { filename: 'licencia_conducir.pdf', contentType: 'application/pdf' });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data.document).to.have.property('originalName', 'licencia_conducir.pdf');
    expect(res.body.data.document).to.have.property('documentType', 'licencia');

    const diskPath = path.join(process.cwd(), 'uploads', 'licenses', res.body.data.document.fileName);
    createdFiles.push(diskPath);
  });

  it('POST /api/users/:id/documents debe devolver 400 con FILE_REQUIRED si no se envía archivo', async function () {
    const res = await request(app)
      .post(`/api/users/${testUser._id}/documents`)
      .field('documentType', 'dni');

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('code', 'FILE_REQUIRED');
  });

  it('POST /api/users/:id/documents debe devolver 400 con INVALID_DOCUMENT_TYPE si el tipo es inválido', async function () {
    const fakeImgBuffer = Buffer.from('fake-png-content');

    const res = await request(app)
      .post(`/api/users/${testUser._id}/documents`)
      .field('documentType', 'pasaporte_inventado')
      .attach('document', fakeImgBuffer, { filename: 'foto.png', contentType: 'image/png' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('code', 'INVALID_DOCUMENT_TYPE');
  });

  it('POST /api/deliveries/:id/receipt debe devolver 404 con DELIVERY_NOT_FOUND si la entrega no existe', async function () {
    const fakeDeliveryId = '64b000000000000000000088';
    const fakePdfBuffer = Buffer.from('%PDF-1.4 comprobante');

    const res = await request(app)
      .post(`/api/deliveries/${fakeDeliveryId}/receipt`)
      .attach('receipt', fakePdfBuffer, { filename: 'remito.pdf', contentType: 'application/pdf' });

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('code', 'DELIVERY_NOT_FOUND');
  });
});

