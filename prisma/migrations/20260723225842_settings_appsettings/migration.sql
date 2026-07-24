-- CreateTable
CREATE TABLE `AppSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `appName` VARCHAR(191) NOT NULL DEFAULT 'Le Chaudron qui sent bon',
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Europe/Paris',
    `colorPrimary` VARCHAR(191) NOT NULL DEFAULT '#3F5D4A',
    `colorAccent` VARCHAR(191) NOT NULL DEFAULT '#C4A35A',
    `colorBg` VARCHAR(191) NOT NULL DEFAULT '#FAFAF8',
    `colorFg` VARCHAR(191) NOT NULL DEFAULT '#1C1C1A',
    `fontPreset` ENUM('serife_campagne', 'sans_lisible', 'mixte') NOT NULL DEFAULT 'mixte',
    `logoPath` VARCHAR(191) NULL,
    `radius` ENUM('none', 'sm', 'md') NOT NULL DEFAULT 'sm',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
