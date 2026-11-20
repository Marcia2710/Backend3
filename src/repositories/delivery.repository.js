import DeliveryModel from '../models/delivery.model.js';

export class DeliveryRepository {
  async getAll({ page = 1, limit = 10, status } = {}) {
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    return await DeliveryModel.find(query)
      .populate('order')
      .populate('driver', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .lean();
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

  async attachReceipt(id, receiptMetadata) {
    return await DeliveryModel.findByIdAndUpdate(
      id,
      { receipt: receiptMetadata },
      { new: true }
    );
  }
}
