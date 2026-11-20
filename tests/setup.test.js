import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

import UserModel from '../src/models/user.model.js';
import ProductModel from '../src/models/product.model.js';
import OrderModel from '../src/models/order.model.js';
import DeliveryModel from '../src/models/delivery.model.js';

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
