-- AlterTable
ALTER TABLE `Parametres` ADD COLUMN `budgetEauM3An` DOUBLE NULL,
    ADD COLUMN `rendementDefautKgHaSec` DOUBLE NOT NULL DEFAULT 500;

-- CreateTable
CREATE TABLE `PropositionPlan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `annee` INTEGER NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `statut` ENUM('brouillon', 'active', 'appliquee', 'archivee') NOT NULL DEFAULT 'brouillon',
    `inclureCommandes` BOOLEAN NOT NULL DEFAULT false,
    `parametres` JSON NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PropositionPlan_annee_statut_idx`(`annee`, `statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropositionLigne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propositionId` INTEGER NOT NULL,
    `especeId` INTEGER NULL,
    `matiereId` INTEGER NULL,
    `priorite` ENUM('P1', 'P2', 'P3') NOT NULL DEFAULT 'P2',
    `besoinKgBrut` DOUBLE NOT NULL DEFAULT 0,
    `stockKg` DOUBLE NOT NULL DEFAULT 0,
    `besoinKgNet` DOUBLE NOT NULL DEFAULT 0,
    `surfaceM2Calculee` DOUBLE NULL,
    `surfaceM2` DOUBLE NULL,
    `plancheId` INTEGER NULL,
    `faisabilite` ENUM('vert', 'jaune', 'rouge', 'non_place') NOT NULL DEFAULT 'non_place',
    `besoinEau` ENUM('faible', 'modere', 'eleve') NULL,
    `eauLEstime` DOUBLE NULL,
    `lotCultureExistantId` INTEGER NULL,
    `lotCultureCreeId` INTEGER NULL,
    `manuelle` BOOLEAN NOT NULL DEFAULT false,
    `motif` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `sources` JSON NULL,

    INDEX `PropositionLigne_propositionId_idx`(`propositionId`),
    INDEX `PropositionLigne_especeId_idx`(`especeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PropositionLigne` ADD CONSTRAINT `PropositionLigne_propositionId_fkey` FOREIGN KEY (`propositionId`) REFERENCES `PropositionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropositionLigne` ADD CONSTRAINT `PropositionLigne_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropositionLigne` ADD CONSTRAINT `PropositionLigne_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropositionLigne` ADD CONSTRAINT `PropositionLigne_lotCultureExistantId_fkey` FOREIGN KEY (`lotCultureExistantId`) REFERENCES `LotCulture`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropositionLigne` ADD CONSTRAINT `PropositionLigne_lotCultureCreeId_fkey` FOREIGN KEY (`lotCultureCreeId`) REFERENCES `LotCulture`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
