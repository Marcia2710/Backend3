import OrderModel from '../models/order.model.js';

export class OrderRepository {
   async getAll({ page = 1, limit = 10, status } = {}) {
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    return await OrderModel.find(query)
      .populate('user', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .lean();
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
