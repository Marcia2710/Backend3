import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/index.js';

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: Object.values(DELIVERY_STATUS),
    default: DELIVERY_STATUS.ASSIGNED
  },
  trackingCode: {
    type: String,
    required: true,
    unique: true
  },
  estimatedDelivery: {
    type: Date
  },
    receipt: {
    originalName: { type: String },
    fileName: { type: String },
    path: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    documentType: { type: String, default: 'comprobante_entrega' },
    uploadedAt: { type: Date }
  }

  
}, {
  timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
