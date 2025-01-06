import { validateSupplier } from './supplier.validator';

interface SupplierData {
  name: string;
  contact?: string;
  email?: string;
  address?: string;
}

export const validateMedicine = (data: any) => {
  const { name, packageType, unitPrice, supplier, supplierId } = data;
  
  if (!name || typeof name !== 'string') {
    return 'Name is required and must be a string';
  }
  
  if (!packageType || typeof packageType !== 'string') {
    return 'Package type is required and must be a string';
  }
  
  if (!unitPrice || typeof unitPrice !== 'number' || unitPrice <= 0) {
    return 'Unit price is required and must be a positive number';
  }

  // Validate supplier if provided without supplierId
  if (!supplierId && supplier) {
    const supplierError = validateSupplier(supplier);
    if (supplierError) {
      return supplierError;
    }
  }
  
  return null;
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
