export const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  DRIVER: 'repartidor'
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock'
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
});

export const ORDER_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
});

export const DELIVERY_STATUS = Object.freeze({
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_ROUTE: 'in_route',
  DELIVERED: 'delivered',
  FAILED: 'failed'
});

export const DOCUMENT_TYPES = Object.freeze({
  DNI: 'dni',
  LICENSE: 'licencia',
  ADDRESS_PROOF: 'comprobante_domicilio',
  DELIVERY_RECEIPT: 'comprobante_entrega'
});
