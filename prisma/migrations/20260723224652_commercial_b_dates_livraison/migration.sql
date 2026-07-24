-- AlterTable
ALTER TABLE `VenteLigne` ADD COLUMN `stockMouvementIds` JSON NULL;

-- CreateTable
CREATE TABLE `PointVenteDateLivraison` (
    `pointVenteId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`pointVenteId`, `date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PointVenteDateLivraison` ADD CONSTRAINT `PointVenteDateLivraison_pointVenteId_fkey` FOREIGN KEY (`pointVenteId`) REFERENCES `PointVente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
