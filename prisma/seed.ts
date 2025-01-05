import { PrismaClient } from '@prisma/client';
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
      }
    });

    // Create sample supplier
    const supplier = await prisma.supplier.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Sample Supplier',
        contactInfo: '+27123456789',
        address: '123 Main Street',
      }
    });

    // Create sample medicine
    const medicine = await prisma.medicine.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Paracetamol',
        description: 'Pain relief medication',
        package: '500mg tablets',
        price: 29.99,
        quantity: 100,
        supplierId: supplier.id
      }
    });

    console.log('Seed data created successfully:', {
      adminUser,
      supplier,
      medicine
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
