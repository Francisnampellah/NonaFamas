/*
  Warnings:

  - You are about to drop the column `action` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `element` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `package` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Medicine` table. All the data in the column will be lost.
  - Added the required column `actionType` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packageType` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "action",
ADD COLUMN     "actionType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "element",
DROP COLUMN "package",
DROP COLUMN "price",
DROP COLUMN "quantity",
ADD COLUMN     "elementId" INTEGER,
ADD COLUMN     "packageType" TEXT NOT NULL,
ADD COLUMN     "stockCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Inventory_medicineId_idx" ON "Inventory"("medicineId");

-- CreateIndex
CREATE INDEX "Inventory_userId_idx" ON "Inventory"("userId");

-- CreateIndex
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");

-- CreateIndex
CREATE INDEX "Medicine_supplierId_idx" ON "Medicine"("supplierId");

-- CreateIndex
CREATE INDEX "Sale_medicineId_idx" ON "Sale"("medicineId");

-- CreateIndex
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE INDEX "Transaction_saleId_idx" ON "Transaction"("saleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
