export const validateMedicine = (data: any) => {
  const { name, packageType, unitPrice } = data;
  
  if (!name || typeof name !== 'string') {
    return 'Name is required and must be a string';
  }
  
  if (!packageType || typeof packageType !== 'string') {
    return 'Package type is required and must be a string';
  }
  
  if (!unitPrice || typeof unitPrice !== 'number' || unitPrice <= 0) {
    return 'Unit price is required and must be a positive number';
  }
  
  return null;
};
