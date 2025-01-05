export const validateInventory = (data: any) => {
  const { medicineId, quantity, userId } = data;
  
  if (!medicineId || typeof medicineId !== 'number') {
    return 'Medicine ID is required and must be a number';
  }
  
  if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
    return 'Quantity is required and must be a positive number';
  }
  
  if (!userId || typeof userId !== 'number') {
    return 'User ID is required and must be a number';
  }
  
  return null;
};
