/*
  Warnings:

  - You are about to alter the column `title` on the `todos` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `todos` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;
