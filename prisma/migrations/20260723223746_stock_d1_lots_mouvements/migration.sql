-- AlterTable
ALTER TABLE `Matiere` ADD COLUMN `stockMini` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Parametres` ADD COLUMN `seuilJoursAlerteDluo` INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE `ProduitFini` ADD COLUMN `stockMini` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Emplacement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Emplacement_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotStockMatiere` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matiereId` INTEGER NOT NULL,
    `emplacementId` INTEGER NULL,
    `quantiteInitiale` DOUBLE NOT NULL,
    `quantiteRestante` DOUBLE NOT NULL,
    `unite` ENUM('kg', 'L', 'piece') NOT NULL,
    `dateEntree` DATE NOT NULL,
    `datePeremption` DATE NULL,
    `numerosSacs` JSON NULL,
    `coutUnitaire` DOUBLE NULL,
    `sourceType` ENUM('recolte', 'achat', 'transformation', 'ajustement', 'transfert') NOT NULL,
    `sourceId` INTEGER NULL,
    `recolteId` INTEGER NULL,
    `achatId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LotStockMatiere_achatId_key`(`achatId`),
    INDEX `LotStockMatiere_matiereId_quantiteRestante_idx`(`matiereId`, `quantiteRestante`),
    INDEX `LotStockMatiere_datePeremption_idx`(`datePeremption`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotStockProduit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produitFiniId` INTEGER NOT NULL,
    `emplacementId` INTEGER NULL,
    `quantiteInitiale` DOUBLE NOT NULL,
    `quantiteRestante` DOUBLE NOT NULL,
    `dateEntree` DATE NOT NULL,
    `datePeremption` DATE NULL,
    `numeroLotProduction` VARCHAR(191) NULL,
    `poidsKg` DOUBLE NULL,
    `notes` TEXT NULL,
    `sourceType` ENUM('production', 'ajustement', 'transfert') NOT NULL,
    `sourceId` INTEGER NULL,
    `productionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LotStockProduit_produitFiniId_quantiteRestante_idx`(`produitFiniId`, `quantiteRestante`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mouvement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `sens` ENUM('entree', 'sortie', 'ajustement', 'transfert') NOT NULL,
    `cible` ENUM('matiere', 'produit') NOT NULL,
    `lotMatiereId` INTEGER NULL,
    `lotProduitId` INTEGER NULL,
    `quantite` DOUBLE NOT NULL,
    `emplacementId` INTEGER NULL,
    `motif` VARCHAR(191) NULL,
    `operateurNom` VARCHAR(191) NULL,
    `refType` VARCHAR(191) NULL,
    `refId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Mouvement_date_idx`(`date`),
    INDEX `Mouvement_lotMatiereId_idx`(`lotMatiereId`),
    INDEX `Mouvement_lotProduitId_idx`(`lotProduitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Achat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matiereId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `prixUnitaire` DOUBLE NOT NULL,
    `devise` VARCHAR(191) NOT NULL DEFAULT 'EUR',
    `fournisseur` VARCHAR(191) NULL,
    `lien` VARCHAR(191) NULL,
    `emplacementId` INTEGER NULL,
    `datePeremption` DATE NULL,
    `ajouterPrixCatalogue` BOOLEAN NOT NULL DEFAULT true,
    `operateurNom` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LotStockMatiere` ADD CONSTRAINT `LotStockMatiere_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotStockMatiere` ADD CONSTRAINT `LotStockMatiere_emplacementId_fkey` FOREIGN KEY (`emplacementId`) REFERENCES `Emplacement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotStockMatiere` ADD CONSTRAINT `LotStockMatiere_achatId_fkey` FOREIGN KEY (`achatId`) REFERENCES `Achat`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotStockProduit` ADD CONSTRAINT `LotStockProduit_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `ProduitFini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotStockProduit` ADD CONSTRAINT `LotStockProduit_emplacementId_fkey` FOREIGN KEY (`emplacementId`) REFERENCES `Emplacement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mouvement` ADD CONSTRAINT `Mouvement_lotMatiereId_fkey` FOREIGN KEY (`lotMatiereId`) REFERENCES `LotStockMatiere`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mouvement` ADD CONSTRAINT `Mouvement_lotProduitId_fkey` FOREIGN KEY (`lotProduitId`) REFERENCES `LotStockProduit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mouvement` ADD CONSTRAINT `Mouvement_emplacementId_fkey` FOREIGN KEY (`emplacementId`) REFERENCES `Emplacement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achat` ADD CONSTRAINT `Achat_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Achat` ADD CONSTRAINT `Achat_emplacementId_fkey` FOREIGN KEY (`emplacementId`) REFERENCES `Emplacement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
