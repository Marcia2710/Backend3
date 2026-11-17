import { ProductRepository } from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { config } from '../config/env.config.js';

const productRepository = new ProductRepository();

const emailProvider = {
  send: async (message) => {
    console.log('[EMAIL] ' + message);
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
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async calculateShippingCost(id) {
    const product = await this.getProductById(id);
    
    // Usamos tu archivo de configuración en lugar de hardcodear
    if (!config.shippingApiKey) throw new Error('Falta API key');
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
      throw new Error('Faltan campos obligatorios');
    }
    if (price < 0) {
      throw new Error('Precio inválido');
    }

    const existing = await productRepository.getByCode(code);
    if (existing) {
      throw new Error('El código de producto ya existe');
    }

    const stock = productData.stock || 0;
    const newProduct = await productRepository.create({
      ...productData,
      stock,
      status: stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK
    });

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
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.delete(id);
    if (!product) throw new Error('Producto no encontrado');
    return product;
  }
}

