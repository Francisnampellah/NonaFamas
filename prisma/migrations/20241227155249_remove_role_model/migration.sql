/*
  Warnings:

  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `package` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "element" INTEGER,
ADD COLUMN     "package" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId";

-- DropTable
DROP TABLE "Role";
