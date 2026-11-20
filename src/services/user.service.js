import fs from 'fs';
import { UserRepository } from '../repositories/user.repository.js';
import { ROLES, DOCUMENT_TYPES } from '../constants/index.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

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

  async uploadUserDocument(userId, file, documentType) {
    if (!file) {
      throw new CustomError(ERROR_DICTIONARY.FILE_REQUIRED);
    }

    const validTypes = [DOCUMENT_TYPES.DNI, DOCUMENT_TYPES.LICENSE, DOCUMENT_TYPES.ADDRESS_PROOF];
    if (documentType && !validTypes.includes(documentType)) {
      fs.unlinkSync(file.path);
      throw new CustomError(
        ERROR_DICTIONARY.INVALID_DOCUMENT_TYPE,
        `Tipo de documento '${documentType}' inválido. Permitidos: ${validTypes.join(', ')}.`
      );
    }

    const user = await userRepository.getById(userId);
    if (!user) {
      fs.unlinkSync(file.path);
      throw new CustomError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }

    const relativeFolder = file.destination.split('uploads')[1].replace(/\\/g, '/').replace(/^\//, '');
    const metadata = {
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/${relativeFolder}/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      documentType: documentType || DOCUMENT_TYPES.DNI,
      uploadedAt: new Date()
    };

    const updatedUser = await userRepository.addDocument(userId, metadata);
    logger.info(`Documento (${metadata.documentType}) asociado al usuario ${userId}: ${file.filename}`);

    return {
      user: updatedUser,
      document: metadata
    };
  }
}
