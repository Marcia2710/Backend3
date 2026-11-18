import { UserService } from '../services/user.service.js';

const userService = new UserService();

export class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newUser = await userService.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
      next(error);
    }
  }
}
