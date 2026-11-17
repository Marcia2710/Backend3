import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Error del servidor' });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      const status = error.message === 'Usuario no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error.statusCode === 403) {
        return res.status(403).json({ message: error.message });
      }
      const isBadRequest = ['Faltan campos obligatorios', 'El email ya está registrado'].includes(error.message);
      return res.status(isBadRequest ? 400 : 500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      const status = error.message === 'Usuario no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
      const status = error.message === 'Usuario no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }
}
