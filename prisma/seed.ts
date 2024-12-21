import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.create({
    data: { name: 'ADMIN' }
  });
  
  const pharmacistRole = await prisma.role.create({
    data: { name: 'PHARMACIST' }
  });

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@famasi.com',
        password: 'hashed_password_123',
        roleId: adminRole.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'John Pharmacist',
        email: 'john@famasi.com',
        password: 'hashed_password_456',
        roleId: pharmacistRole.id
      }
    })
  ]);

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Pharma Plus Ltd',
        contactInfo: 'contact@pharmaplus.com',
        address: '123 Pharma Street'
      }
    }),
    prisma.supplier.create({
      data: {
        name: 'MediCore Supplies',
        contactInfo: 'info@medicore.com',
        address: '456 Health Avenue'
      }
    })
  ]);

  // Create medicines
  const medicines = await Promise.all([
    prisma.medicine.create({
      data: {
        name: 'Paracetamol',
        description: 'Pain reliever and fever reducer',
        price: 5.99,
        quantity: 200,
        supplierId: suppliers[0].id
      }
    }),
    prisma.medicine.create({
      data: {
        name: 'Amoxicillin',
        description: 'Antibiotic medication',
        price: 12.99,
        quantity: 150,
        supplierId: suppliers[0].id
      }
    }),
    prisma.medicine.create({
      data: {
        name: 'Ibuprofen',
        description: 'Anti-inflammatory drug',
        price: 7.99,
        quantity: 180,
        supplierId: suppliers[1].id
      }
    })
  ]);

  // Create inventory records
  await Promise.all([
    prisma.inventory.create({
      data: {
        medicineId: medicines[0].id,
        quantity: 200,
        action: 'restock',
        userId: users[0].id
      }
    }),
    prisma.inventory.create({
      data: {
        medicineId: medicines[1].id,
        quantity: 150,
        action: 'restock',
        userId: users[0].id
      }
    }),
    prisma.inventory.create({
      data: {
        medicineId: medicines[2].id,
        quantity: 180,
        action: 'restock',
        userId: users[1].id
      }
    })
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
