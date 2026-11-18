import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Módulo de Mocks (/api/mocks)', function () {
  it('GET /api/mocks/users?qty=3 debe devolver 3 usuarios simulados con estructura válida', async function () {
    const res = await request(app).get('/api/mocks/users?qty=3');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(3);
    expect(res.body[0]).to.include.all.keys('firstName', 'lastName', 'email', 'role');
  });

  it('GET /api/mocks/users?qty=-5 debe devolver 400 con código INVALID_MOCK_QTY', async function () {
    const res = await request(app).get('/api/mocks/users?qty=-5');
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('code', 'INVALID_MOCK_QTY');
  });

  it('POST /api/mocks/seed?qty=2 debe insertar registros en la BD de testing y devolver 201', async function () {
    const res = await request(app).post('/api/mocks/seed?qty=2');
    expect(res.status).to.equal(201);
    expect(res.body.insertados).to.deep.equal({
      usuarios: 2,
      productos: 2,
      pedidos: 2,
      entregas: 2
    });
  });

  it('POST /api/mocks/seed?qty=abc debe devolver 400 con código INVALID_MOCK_QTY', async function () {
    const res = await request(app).post('/api/mocks/seed?qty=abc');
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('code', 'INVALID_MOCK_QTY');
  });
});
