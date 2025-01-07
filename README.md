# NonaFamas

// This is your Prisma schema file
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String // Should be hashed in application logic
  roles     Role[]   @relation("UserRoles") // Many-to-many relationship with roles
  phone     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sales     Sale[]
  inventory Inventory[]
  auditLogs AuditLog[]

  @@index([email])
}

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique
  users User[] @relation("UserRoles") // Many-to-many relationship with users
}

model Medicine {
  id          Int       @id @default(autoincrement())
  name        String
  genericName String?
  description String?
  packageType String
  dosageForm  String?
  unitPrice   Float
  stockCount  Int       @default(0)
  expiryDate  DateTime?
  supplierId  Int?
  categories  Category[] @relation("MedicineCategories") // Many-to-many with Category
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  supplier  Supplier? @relation(fields: [supplierId], references: [id])
  sales     Sale[]
  inventory Inventory[]

  @@index([name])
  @@index([supplierId])
}

model Category {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  medicines Medicine[] @relation("MedicineCategories") // Many-to-many with Medicine
}

model Sale {
  id            Int      @id @default(autoincrement())
  medicineId    Int
  quantity      Int
  totalPrice    Float
  userId        Int?
  prescriptionId String? // Optional prescription ID
  discount      Float?    // Optional discount
  createdAt     DateTime @default(now())

  medicine    Medicine @relation(fields: [medicineId], references: [id])
  user        User?    @relation(fields: [userId], references: [id])
  transactions Transaction[]

  @@index([medicineId])
  @@index([userId])
}

model Inventory {
  id         Int      @id @default(autoincrement())
  medicineId Int
  quantity   Int
  actionType String
  reason     String? // Reason for inventory change
  userId     Int
  createdAt  DateTime @default(now())

  medicine Medicine @relation(fields: [medicineId], references: [id])
  user     User     @relation(fields: [userId], references: [id])

  @@index([medicineId])
  @@index([userId])
}

model Supplier {
  id          Int      @id @default(autoincrement())
  name        String
  contactInfo String?
  email       String
  address     String
  medicines   Medicine[]

  @@index([name])
}

model Transaction {
  id          Int      @id @default(autoincrement())
  saleId      Int
  paymentType String
  amountPaid  Float
  createdAt   DateTime @default(now())

  sale Sale @relation(fields: [saleId], references: [id])

  @@index([saleId])
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int
  action    String
  details   String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([createdAt])
}
