import { ProductService } from '../services/product.service.js';

const productService = new ProductService();

export class ProductController {
  async getAll(req, res) {
    try {
      const products = await productService.getProducts(req.query.all);
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: 'Error del servidor' });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(200).json(product);
    } catch (error) {
      const status = error.message === 'Producto no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  async getShippingCost(req, res) {
    try {
      const costData = await productService.calculateShippingCost(req.params.id);
      return res.status(200).json(costData);
    } catch (error) {
      const status = error.message === 'Producto no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json(newProduct);
    } catch (error) {
      const isBadRequest = ['Faltan campos obligatorios', 'Precio inválido', 'El código de producto ya existe'].includes(error.message);
      return res.status(isBadRequest ? 400 : 500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await productService.updateProduct(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      const status = error.message === 'Producto no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
      const status = error.message === 'Producto no encontrado' ? 404 : 500;
      return res.status(status).json({ message: error.message });
    }
  }
}


