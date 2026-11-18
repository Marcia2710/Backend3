import { ProductRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { config } from '../config/env.config.js';
import { CustomError } from '../errors/CustomError.js';
import { ERROR_DICTIONARY } from '../errors/errorDictionary.js';
import { logger } from '../config/logger.config.js';

const productRepository = new ProductRepository();

const emailProvider = {
  send: async (message) => {
    logger.debug(`[EMAIL SIMULADO] ${message}`);
  }
};

export class ProductService {
  async getProducts(showAll) {
    if (showAll === 'true') {
      return await productRepository.getAll();
    }
    return await productRepository.getAllAvailable();
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      throw new CustomError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async calculateShippingCost(id) {
    const product = await this.getProductById(id);
    
    if (!config.shippingApiKey) {
      throw new CustomError(ERROR_DICTIONARY.MISSING_API_KEY);
    }
    const isProduction = config.env === 'production';

    const shippingCost = isProduction ? 50 + product.price * 0.01 : 10;
    return { 
      product: product._id, 
      declaredValue: product.price, 
      shippingCost 
    };
  }

  async createProduct(productData) {
    const { title, code, price } = productData;

    if (!title || !code || price === undefined) {
      throw new CustomError(
        ERROR_DICTIONARY.VALIDATION_ERROR, 
        'Los campos title, code y price son obligatorios.'
      );
    }
    if (price < 0) {
      throw new CustomError(ERROR_DICTIONARY.INVALID_PRODUCT_PRICE);
    }

    const existing = await productRepository.getByCode(code);
    if (existing) {
      throw new CustomError(ERROR_DICTIONARY.DUPLICATE_PRODUCT_CODE);
    }

    const stock = productData.stock || 0;
    const newProduct = await productRepository.create({
      ...productData,
      stock,
      status: stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK
    });

    // Aquí queda ubicado el registro del evento con Winston
    logger.info(`Producto creado: ${newProduct.title} (Código: ${newProduct.code})`);

    await emailProvider.send('Producto creado: ' + newProduct.title);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    if (updateData.status && updateData.status.toLowerCase() === 'out_of_stock') {
      updateData.status = PRODUCT_STATUS.OUT_OF_STOCK;
    }

    if (updateData.stock !== undefined) {
      updateData.status = updateData.stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const product = await productRepository.update(id, updateData);
    if (!product) {
      throw new CustomError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
    }

    logger.info(`Producto actualizado: ${product.title} (ID: ${product._id})`);
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (!product) {
      throw new CustomError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
    }

    logger.warning(`Producto eliminado: ${product.title} (ID: ${product._id})`);
    return product;
  }
}

