import { UserRepository } from '../repositories/user.repository.js';
import { ROLES } from '../constants/index.js';

const userRepository = new UserRepository();

export class UserService {
  async getAllUsers() {
    return await userRepository.getAll();
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async createUser(userData) {
    const { firstName, lastName, email, password, role } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new Error('Faltan campos obligatorios');
    }

    const existing = await userRepository.getByEmail(email);
    if (existing) {
      throw new Error('El email ya está registrado');
    }

    // Regla de negocio: usamos la constante ROLES en lugar de strings sueltos
    if (role === ROLES.ADMIN) {
      const forbiddenError = new Error('No se puede crear un admin desde este endpoint');
      forbiddenError.statusCode = 403;
      throw forbiddenError;
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
    if (!updatedUser) throw new Error('Usuario no encontrado');
    return updatedUser;
  }

  async deleteUser(id) {
    const deletedUser = await userRepository.delete(id);
    if (!deletedUser) throw new Error('Usuario no encontrado');
    return deletedUser;
  }
}

