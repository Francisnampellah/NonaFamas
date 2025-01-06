interface SupplierData {
  name: string;
  contact?: string;
  email?: string;
  address?: string;
}

export const validateSupplier = (supplier: any): string | null => {
  if (typeof supplier !== 'object') {
    return 'Supplier must be an object';
  }

  // Validate supplier name
  if (!supplier.name || typeof supplier.name !== 'string') {
    return 'Supplier name is required and must be a string';
  }

  // Validate supplier email if provided
  if (supplier.email && !isValidEmail(supplier.email)) {
    return 'Invalid supplier email format';
  }

  // Validate supplier contact if provided
  if (supplier.contact && typeof supplier.contact !== 'string') {
    return 'Supplier contact must be a string';
  }

  // Validate supplier address if provided
  if (supplier.address && typeof supplier.address !== 'string') {
    return 'Supplier address must be a string';
  }

  return null;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
