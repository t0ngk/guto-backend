-- AlterTable
ALTER TABLE `State` ADD COLUMN `time` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('success', 'error', 'info', 'warning') NOT NULL DEFAULT 'info';
