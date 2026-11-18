import OrderModel from '../models/order.model.js';

export class OrderRepository {
  async getAll() {
    return await OrderModel.find().populate('user', 'firstName lastName email');
  }
  async getById(id) {
    return await OrderModel.findById(id).populate('user', 'firstName lastName email');
  }
  async create(data) {
    return await OrderModel.create(data);
  }
  async updateStatus(id, status) {
    return await OrderModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
