/*
  Warnings:

  - Added the required column `service` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceOf` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Pet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Pet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Appointment` ADD COLUMN `service` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceOf` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Pet` ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL;
