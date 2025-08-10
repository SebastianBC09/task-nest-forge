/*
  Warnings:

  - You are about to drop the column `updatedA` on the `Task` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "updatedA",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
