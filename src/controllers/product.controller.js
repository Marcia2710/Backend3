import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
  async getAll(req, res, next) {
    try {
      const products = await productService.getProducts(req.query.all);
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  async getShippingCost(req, res, next) {
    try {
      const costData = await productService.calculateShippingCost(req.params.id);
      return res.status(200).json(costData);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }
}
