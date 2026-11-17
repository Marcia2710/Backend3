import ProductModel from '../models/product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

export class ProductRepository {
  async getAll() {
    return await ProductModel.find();
  }

  async getAllAvailable() {
    // Filtro encapsulado en el repositorio (evita ser solo pasamanos)
    return await ProductModel.find({ 
      stock: { $gt: 0 }, 
      status: PRODUCT_STATUS.AVAILABLE 
    });
  }

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async getByCode(code) {
    return await ProductModel.findOne({ code });
  }

  async create(productData) {
    return await ProductModel.create(productData);
  }

  async update(id, updateData) {
    return await ProductModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
}
