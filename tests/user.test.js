import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app.js';
import UserModel from '../src/models/user.model.js';

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
    const res = await request(app)
      .post('/api/users')
      .send({ firstName: 'SinApellido' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('code', 'VALIDATION_ERROR');
  });

  it('GET /api/users/:id debe devolver 404 con USER_NOT_FOUND si el usuario no existe', async function () {
    const fakeId = '64b000000000000000000099';
    const res = await request(app).get(`/api/users/${fakeId}`);

    expect(res.status).to.equal(404);
    expect(res.body).to.have.property('status', 'error');
    expect(res.body).to.have.property('code', 'USER_NOT_FOUND');
  });
});
