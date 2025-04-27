import { UserRole } from '@prisma/client';

// Auth Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
}

// Medicine Types
export interface MedicineRequest {
  name: string;
  manufacturer: string | number;
  unit: string | number;
  category: string | number;
  sellPrice: number;
}

export interface MedicineResponse {
  id: number;
  name: string;
  manufacturerId: number;
  unitId: number;
  categoryId: number;
  sellPrice: number;
  manufacturer: {
    id: number;
    name: string;
  };
  unit: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    name: string;
  };
  stock?: {
    quantity: number;
  };
}

// Manufacturer Types
export interface ManufacturerRequest {
  name: string;
}

export interface ManufacturerResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Unit Types
export interface UnitRequest {
  name: string;
}

export interface UnitResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface CategoryRequest {
  name: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Types
export interface SupplierRequest {
  name: string;
  contact?: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
  contact?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Types
export interface PurchaseRequest {
  medicineId: number;
  batchId: number;
  supplierId: number;
  userId: number;
  quantity: number;
  costPerUnit: number;
}

export interface PurchaseResponse {
  id: number;
  medicineId: number;
  batchId: number;
  supplierId: number;
  userId: number;
  quantity: number;
  costPerUnit: number;
  medicine: MedicineResponse;
  batch: {
    id: number;
    purchaseDate: Date;
  };
  supplier: SupplierResponse;
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Stock Types
export interface StockRequest {
  quantity: number;
}

export interface StockAdjustmentRequest {
  adjustment: number;
}

export interface StockResponse {
  id: number;
  medicineId: number;
  quantity: number;
  medicine: MedicineResponse;
  createdAt: Date;
  updatedAt: Date;
}

// Error Response Type
export interface ErrorResponse {
  error: string;
  details?: any;
} 