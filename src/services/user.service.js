import { UserRepository } from '../repositories/user.repository.js';
import { ROLES } from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';

const userRepository = new UserRepository();

export class UserService {
  async getAllUsers() {
    return await userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) {
      throw new CustomError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }
    return user;
  }

  async createUser(userData) {
    const { firstName, lastName, email, password, role } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new CustomError(
        ERROR_DICTIONARY.VALIDATION_ERROR,
        'Los campos firstName, lastName, email y password son obligatorios.'
      );
    }

    const existing = await userRepository.getByEmail(email);
    if (existing) {
      throw new CustomError(ERROR_DICTIONARY.EMAIL_ALREADY_EXISTS);
    }

    if (role === ROLES.ADMIN) {
      throw new CustomError(ERROR_DICTIONARY.FORBIDDEN_ADMIN_CREATION);
    }

    return await userRepository.create({
      firstName,
      lastName,
      email,
      password,
      role: role || ROLES.USER
    });
  }

  async updateUser(id, updateData) {
    const updatedUser = await userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new CustomError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }
    return updatedUser;
  }

  async deleteUser(id) {
    const deletedUser = await userRepository.delete(id);
    if (!deletedUser) {
      throw new CustomError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }
    return deletedUser;
  }
}
