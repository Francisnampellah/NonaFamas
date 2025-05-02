/*
  Warnings:

  - You are about to drop the column `supplierId` on the `Purchase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_supplierId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "supplierId";
