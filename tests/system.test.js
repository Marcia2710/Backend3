import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';

describe('Endpoints de Sistema (Health, Logger, Swagger y 404)', function () {
  it('GET /api/health debe devolver estado ok sin exponer secretos', async function () {
    const res = await request(app).get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
    expect(res.body).to.not.have.property('secret');
  });

  it('GET /api/logger-test debe disparar los logs y devolver status 200', async function () {
    const res = await request(app).get('/api/logger-test');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'success');
  });

  it('GET /api/docs/ debe cargar la interfaz HTML de Swagger UI con status 200', async function () {
    const res = await request(app).get('/api/docs/');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Swagger UI');
  });

  it('GET /api/ruta-inexistente debe devolver 404 con código ROUTE_NOT_FOUND', async function () {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('code', 'ROUTE_NOT_FOUND');
  });
});
