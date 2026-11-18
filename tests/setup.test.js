process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import { config } from '../src/config/env.config.js';
import UserModel from '../src/models/user.model.js';
import ProductModel from '../src/models/product.model.js';
import OrderModel from '../src/models/order.model.js';
import DeliveryModel from '../src/models/delivery.model.js';

before(async function () {
  await mongoose.connect(config.mongoUri);
});

after(async function () {
  await UserModel.deleteMany({});
  await ProductModel.deleteMany({});
  await OrderModel.deleteMany({});
  await DeliveryModel.deleteMany({});
  await mongoose.connection.close();
});
