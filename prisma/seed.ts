import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: UserRole.ADMINISTRATOR
      }
    });

    // Create sample units
    const units = await Promise.all([
      prisma.unit.upsert({
        where: { id: 1 },
        update: {},
        create: { name: 'Tablets' }
      }),
      prisma.unit.upsert({
        where: { id: 2 },
        update: {},
        create: { name: 'Capsules' }
      }),
      prisma.unit.upsert({
        where: { id: 3 },
        update: {},
        create: { name: 'Bottles' }
      })
    ]);

    // Create sample categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { id: 1 },
        update: {},
        create: { name: 'Pain Relief' }
      }),
      prisma.category.upsert({
        where: { id: 2 },
        update: {},
        create: { name: 'Antibiotics' }
      }),
      prisma.category.upsert({
        where: { id: 3 },
        update: {},
        create: { name: 'Vitamins' }
      })
    ]);

    // Create sample manufacturers
    const manufacturers = await Promise.all([
      prisma.manufacturer.upsert({
        where: { id: 1 },
        update: {},
        create: { name: 'Pfizer' }
      }),
      prisma.manufacturer.upsert({
        where: { id: 2 },
        update: {},
        create: { name: 'Novartis' }
      }),
      prisma.manufacturer.upsert({
        where: { id: 3 },
        update: {},
        create: { name: 'GSK' }
      })
    ]);

    // Create sample suppliers
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: 'Pharma Distributors',
          contact: '+27123456789'
        }
      }),
      prisma.supplier.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: 'Medical Supplies Co',
          contact: '+27123456790'
        }
      })
    ]);

    // Create sample medicines
    const medicines = await Promise.all([
      prisma.medicine.upsert({
        where: { id: 1 },
        update: {},
        create: {
          name: 'Paracetamol',
          manufacturerId: manufacturers[0].id,
          unitId: units[0].id,
          categoryId: categories[0].id,
          sellPrice: 29.99
        }
      }),
      prisma.medicine.upsert({
        where: { id: 2 },
        update: {},
        create: {
          name: 'Amoxicillin',
          manufacturerId: manufacturers[1].id,
          unitId: units[1].id,
          categoryId: categories[1].id,
          sellPrice: 45.50
        }
      }),
      prisma.medicine.upsert({
        where: { id: 3 },
        update: {},
        create: {
          name: 'Vitamin C',
          manufacturerId: manufacturers[2].id,
          unitId: units[2].id,
          categoryId: categories[2].id,
          sellPrice: 35.75
        }
      })
    ]);

    // Create sample batches
    const batches = await Promise.all([
      prisma.batch.upsert({
        where: { id: 1 },
        update: {},
        create: {
          purchaseDate: new Date()
        }
      }),
      prisma.batch.upsert({
        where: { id: 2 },
        update: {},
        create: {
          purchaseDate: new Date()
        }
      })
    ]);

    // Create sample purchases
    const purchases = await Promise.all([
      prisma.purchase.upsert({
        where: { id: 1 },
        update: {},
        create: {
          medicineId: medicines[0].id,
          batchId: batches[0].id,
          supplierId: suppliers[0].id,
          userId: adminUser.id,
          quantity: 1000,
          costPerUnit: 25.00
        }
      }),
      prisma.purchase.upsert({
        where: { id: 2 },
        update: {},
        create: {
          medicineId: medicines[1].id,
          batchId: batches[1].id,
          supplierId: suppliers[1].id,
          userId: adminUser.id,
          quantity: 500,
          costPerUnit: 40.00
        }
      })
    ]);

    // Create sample stock
    const stocks = await Promise.all([
      prisma.stock.upsert({
        where: { id: 1 },
        update: {},
        create: {
          medicineId: medicines[0].id,
          quantity: 1000
        }
      }),
      prisma.stock.upsert({
        where: { id: 2 },
        update: {},
        create: {
          medicineId: medicines[1].id,
          quantity: 500
        }
      })
    ]);

    console.log('Seed data created successfully:', {
      adminUser,
      units,
      categories,
      manufacturers,
      suppliers,
      medicines,
      batches,
      purchases,
      stocks
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
