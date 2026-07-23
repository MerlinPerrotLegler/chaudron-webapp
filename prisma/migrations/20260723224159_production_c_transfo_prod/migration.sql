-- CreateTable
CREATE TABLE `Transformation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('sechage', 'distillation', 'mondage', 'congelation', 'torrefaction', 'autre') NOT NULL,
    `typeLibelle` VARCHAR(191) NULL,
    `date` DATE NOT NULL,
    `parametres` JSON NULL,
    `matiereOutId` INTEGER NOT NULL,
    `quantiteOut` DOUBLE NOT NULL,
    `uniteOut` ENUM('kg', 'L', 'piece') NOT NULL,
    `rendement` DOUBLE NULL,
    `emplacementOutId` INTEGER NULL,
    `datePeremptionOut` DATE NULL,
    `lotStockMatiereOutId` INTEGER NULL,
    `operateurNom` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `statut` ENUM('brouillon', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'terminee',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransformationLigneIn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transformationId` INTEGER NOT NULL,
    `matiereId` INTEGER NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Production` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetteId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `numeroLot` VARCHAR(191) NOT NULL,
    `facteurEchelle` DOUBLE NOT NULL DEFAULT 1,
    `quantiteSortieVisee` DOUBLE NULL,
    `poidsKg` DOUBLE NULL,
    `datePeremption` DATE NULL,
    `operateurNom` VARCHAR(191) NULL,
    `statut` ENUM('brouillon', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'brouillon',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Production_numeroLot_key`(`numeroLot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionLigneMatiere` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionId` INTEGER NOT NULL,
    `matiereId` INTEGER NOT NULL,
    `quantiteRequise` DOUBLE NOT NULL,
    `poidsKgConsomme` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionSortie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionId` INTEGER NOT NULL,
    `produitFiniId` INTEGER NOT NULL,
    `quantiteUnites` DOUBLE NOT NULL,
    `poidsKg` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `datePeremption` DATE NULL,
    `emplacementId` INTEGER NULL,
    `lotStockProduitId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionEtape` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productionId` INTEGER NOT NULL,
    `etapeRecetteId` INTEGER NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NOT NULL,
    `tempsMainOeuvrePrevuMin` INTEGER NOT NULL DEFAULT 0,
    `tempsAttentePrevuMin` INTEGER NOT NULL DEFAULT 0,
    `statut` ENUM('a_faire', 'en_cours', 'termine') NOT NULL DEFAULT 'a_faire',
    `poidsKg` DOUBLE NULL,
    `notes` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `finishedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transformation` ADD CONSTRAINT `Transformation_matiereOutId_fkey` FOREIGN KEY (`matiereOutId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransformationLigneIn` ADD CONSTRAINT `TransformationLigneIn_transformationId_fkey` FOREIGN KEY (`transformationId`) REFERENCES `Transformation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransformationLigneIn` ADD CONSTRAINT `TransformationLigneIn_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Production` ADD CONSTRAINT `Production_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionLigneMatiere` ADD CONSTRAINT `ProductionLigneMatiere_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `Production`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionLigneMatiere` ADD CONSTRAINT `ProductionLigneMatiere_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionSortie` ADD CONSTRAINT `ProductionSortie_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `Production`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionSortie` ADD CONSTRAINT `ProductionSortie_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `ProduitFini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEtape` ADD CONSTRAINT `ProductionEtape_productionId_fkey` FOREIGN KEY (`productionId`) REFERENCES `Production`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
