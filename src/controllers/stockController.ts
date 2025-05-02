import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';

// Add type for file upload
interface MulterRequest extends Request {
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

// Add type for authenticated request
interface AuthenticatedRequest extends MulterRequest {
  userId: number;
}

const prisma = new PrismaClient();

export const getStock = async (req: Request, res: Response) => {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching stock', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getStockByMedicineId = async (req: Request, res: Response) => {
  const { medicineId } = req.params;

  try {
    const stock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    if (!stock) {
      return res.status(404).json({ 
        success: false,
        error: 'Stock not found for this medicine' 
      });
    }

    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock by medicine ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching stock', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { quantity, pricePerUnit } = req.body;

  try {
    const stock = await prisma.stock.upsert({
      where: { medicineId: parseInt(medicineId) },
      update: { 
        quantity,
        pricePerUnit: pricePerUnit !== undefined ? pricePerUnit : undefined
      },
      create: {
        medicineId: parseInt(medicineId),
        quantity,
        pricePerUnit: pricePerUnit !== undefined ? pricePerUnit : undefined
      },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ 
      success: true,
      message: 'Stock updated successfully', 
      data: stock 
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error updating stock', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const adjustStock = async (req: AuthenticatedRequest, res: Response) => {
  const { medicineId } = req.params;
  const { quantity, pricePerUnit, batchId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: 'User not authenticated' 
    });
  }

  try {
    const currentStock = await prisma.stock.findUnique({
      where: { medicineId: parseInt(medicineId) },
    });

    if (!currentStock) {
      return res.status(404).json({ 
        success: false,
        error: 'Stock not found for this medicine' 
      });
    }

    const newQuantity = currentStock.quantity + quantity;
    if (newQuantity < 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Insufficient stock for this adjustment' 
      });
    }

    // Create a new batch if batchId is not provided
    let finalBatchId = batchId;
    if (!batchId) {
      const newBatch = await prisma.batch.create({
        data: {
          purchaseDate: new Date()
        }
      });
      finalBatchId = newBatch.id;
    }

    // Create purchase record if quantity is positive (stock increase)
    if (quantity > 0) {
      await prisma.purchase.create({
        data: {
          medicineId: parseInt(medicineId),
          batchId: finalBatchId,
          userId,
          quantity,
          costPerUnit: new Prisma.Decimal(pricePerUnit || 0)
        }
      });
    }

    const updatedStock = await prisma.stock.update({
      where: { medicineId: parseInt(medicineId) },
      data: { 
        quantity: newQuantity,
        pricePerUnit: pricePerUnit !== undefined ? new Prisma.Decimal(pricePerUnit) : undefined
      },
      include: {
        medicine: {
          include: {
            manufacturer: true,
            unit: true,
            category: true,
          },
        },
      },
    });

    res.status(200).json({ 
      success: true,
      message: 'Stock adjusted successfully', 
      data: updatedStock 
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error adjusting stock', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getStockUpdateTemplate = async (req: Request, res: Response) => {
  try {
    // Fetch existing medicines for dropdown
    const medicines = await prisma.medicine.findMany({
      include: {
        manufacturer: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Stock Update');

    // Add headers
    sheet.addRow(['Medicine (ID or Name)', 'Quantity', 'Cost Per Unit']);
    
    // Set column definitions
    sheet.columns = [
      { key: 'medicine', width: 40 },
      { key: 'quantity', width: 15 },
      { key: 'costPerUnit', width: 15 },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();

    // Create hidden sheet for dropdown data
    const hiddenSheet = workbook.addWorksheet('Data');
    hiddenSheet.state = 'veryHidden';

    // Add medicine dropdown data
    medicines.forEach((medicine, i) => {
      hiddenSheet.getCell(i + 1, 1).value = `${medicine.id} - ${medicine.name} (${medicine.manufacturer.name})`;
    });

    // Add dropdown validation for medicine column
    const range = `Data!$A$1:$A$${medicines.length}`;
    (sheet as any).dataValidations.add('A2:A1000', {
      type: 'list',
      allowBlank: true,
      formulae: [range],
      showErrorMessage: false, // Allow manual input
    });

    // Send as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=stock_update_template.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ error: 'Failed to generate Excel template' });
  }
};

export const bulkUpdateStock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const batchId  = req.body.batchId;
    const userId = req.user?.id;


    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return res.status(400).json({ error: 'Invalid Excel file format' });
    }

    const updates = [];
    const errors = [];

    // Skip header row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      const medicineValue = row.getCell(1).value;
      const quantity = row.getCell(2).value;
      const costPerUnit = row.getCell(3).value;

      console.log('Processing row:', { medicineValue, quantity, costPerUnit });

      if (!medicineValue || !quantity || !costPerUnit) {
        errors.push(`Row ${i}: Missing required fields`);
        continue;
      }

      try {
        // Extract medicine ID from the format "1 - Paracetamol (PharmaCo)"
        const match = String(medicineValue).match(/^(\d+)/);
        if (!match) {
          errors.push(`Row ${i}: Invalid medicine format - expected format: "1 - Medicine Name (Manufacturer)"`);
          continue;
        }
        const medicineId = parseInt(match[1]);

        // Create a new batch for this bulk update
        // const batch = await prisma.batch.create({
        //   data: {
        //     purchaseDate: new Date(),
        //   },
        // });

        // Create purchase record if quantity is positive
        if (Number(quantity) > 0) {
          await prisma.purchase.create({
            data: {
              medicine: {
                connect: {
                  id: medicineId
                }
              },
              batch: {
                connect: {
                  id: +batchId
                }
              },
              user: {
                connect: {
                  id: userId
                }
              },
              quantity: Number(quantity),
              costPerUnit: new Prisma.Decimal(Number(costPerUnit)),
            } as any, // Type assertion to bypass type checking
          });
        }

        // Update or create stock
        const stock = await prisma.stock.upsert({
          where: { medicineId },
          update: {
            quantity: {
              increment: Number(quantity),
            },
          },
          create: {
            medicineId,
            quantity: Number(quantity),
          },
        });

        updates.push({
          medicineId,
          quantity,
          costPerUnit,
          newTotal: stock.quantity,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Row ${i}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Some updates failed',
        updates,
        errors,
      });
    }

    res.json({
      message: 'Stock updated successfully',
      updates,
    });
  } catch (error) {
    console.error('Error in bulkUpdateStock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
}; 