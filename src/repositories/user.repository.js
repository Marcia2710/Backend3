import UserModel from '../models/user.model.js';

export class UserRepository {
  async getAll({ page = 1, limit = 10, role } = {}) {
    const query = role ? { role } : {};
    const skip = (page - 1) * limit;
    return await UserModel.find(query).select('-password').skip(skip).limit(limit).lean();
  }

  async getById(id) {
    return await UserModel.findById(id).select('-password');
  }

  async getByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(userData) {
    const newUser = await UserModel.create(userData);
    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;
  }

  async update(id, updateData) {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }

  async addDocument(id, documentMetadata) {
    return await UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: documentMetadata } },
      { new: true }
    ).select('-password');
  }
}
