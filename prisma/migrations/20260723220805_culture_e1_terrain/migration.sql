-- CreateTable
CREATE TABLE `Parcelle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `vocation` ENUM('serre_semis', 'tunnel', 'frais', 'maraichage', 'draine_ensoleille', 'grande_culture', 'autre') NOT NULL,
    `typeSol` VARCHAR(191) NULL,
    `ph` DOUBLE NULL,
    `drainage` VARCHAR(191) NULL,
    `pierrosite` VARCHAR(191) NULL,
    `exposition` VARCHAR(191) NULL,
    `pente` VARCHAR(191) NULL,
    `particularites` TEXT NULL,
    `surfaceM2` DOUBLE NULL,
    `archivee` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Parcelle_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Planche` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parcelleId` INTEGER NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `surfaceM2` DOUBLE NOT NULL,
    `particularites` TEXT NULL,
    `archivee` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Planche_code_key`(`code`),
    UNIQUE INDEX `Planche_parcelleId_numero_key`(`parcelleId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TravailSol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plancheId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `operateurNom` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TravailSol_plancheId_date_idx`(`plancheId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Entrant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plancheId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `type` ENUM('compost', 'amendement', 'fertilisation', 'phyto', 'irrigation', 'semence_plant', 'autre') NOT NULL,
    `produit` VARCHAR(191) NOT NULL,
    `quantite` DOUBLE NULL,
    `unite` VARCHAR(191) NULL,
    `refGaine` VARCHAR(191) NULL,
    `refSemencePlant` VARCHAR(191) NULL,
    `operateurNom` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Entrant_plancheId_date_idx`(`plancheId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlancheImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plancheId` INTEGER NOT NULL,
    `cheminFichier` VARCHAR(191) NOT NULL,
    `legende` VARCHAR(191) NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlancheImage_plancheId_idx`(`plancheId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlancheJour` (
    `plancheId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `notes` TEXT NOT NULL,

    PRIMARY KEY (`plancheId`, `date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Planche` ADD CONSTRAINT `Planche_parcelleId_fkey` FOREIGN KEY (`parcelleId`) REFERENCES `Parcelle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TravailSol` ADD CONSTRAINT `TravailSol_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Entrant` ADD CONSTRAINT `Entrant_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlancheImage` ADD CONSTRAINT `PlancheImage_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlancheJour` ADD CONSTRAINT `PlancheJour_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
