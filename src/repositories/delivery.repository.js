import DeliveryModel from '../models/delivery.model.js';

export class DeliveryRepository {
  async getAll() {
    return await DeliveryModel.find().populate('order').populate('driver', 'firstName lastName email');
  }
  async getById(id) {
    return await DeliveryModel.findById(id).populate('order').populate('driver', 'firstName lastName email');
  }
  async create(data) {
    return await DeliveryModel.create(data);
  }
  async updateStatus(id, status) {
    return await DeliveryModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
