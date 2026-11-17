import UserModel from '../models/user.model.js';

export class UserRepository {
  async getAll() {
    // Proyección: nunca devolvemos contraseñas al listar usuarios
    return await UserModel.find().select('-password');
  }

  async getById(id) {
    return await UserModel.findById(id).select('-password');
  }

  async getByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async update(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}
