/*
  Warnings:

  - Added the required column `updatedAt` to the `Espece` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Espece` ADD COLUMN `amendementNotes` TEXT NULL,
    ADD COLUMN `archivee` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `besoinEau` ENUM('faible', 'modere', 'eleve') NULL,
    ADD COLUMN `besoinEauLJour` DOUBLE NULL,
    ADD COLUMN `besoinEauLMois` DOUBLE NULL,
    ADD COLUMN `cycle` ENUM('annuelle', 'bisannuelle', 'vivace') NULL,
    ADD COLUMN `densitePlantsHa` DOUBLE NULL,
    ADD COLUMN `espacementCm` DOUBLE NULL,
    ADD COLUMN `exposition` VARCHAR(191) NULL,
    ADD COLUMN `famille` VARCHAR(191) NULL,
    ADD COLUMN `nomLatin` VARCHAR(191) NULL,
    ADD COLUMN `phMax` DOUBLE NULL,
    ADD COLUMN `phMin` DOUBLE NULL,
    ADD COLUMN `rendementKgHaSec` DOUBLE NULL,
    ADD COLUMN `rendementTHaFrais` DOUBLE NULL,
    ADD COLUMN `renouvellementAns` INTEGER NULL,
    ADD COLUMN `tempsAvantRepiquage` INTEGER NULL,
    ADD COLUMN `tempsLeveeMax` INTEGER NULL,
    ADD COLUMN `tempsLeveeMin` INTEGER NULL,
    ADD COLUMN `typeSol` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `ItineraireEtape` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especeId` INTEGER NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `code` ENUM('semis', 'plantation', 'recolte', 'taille', 'division', 'autre') NOT NULL,
    `libelle` VARCHAR(191) NULL,
    `dureeDepuisPrecedenteJours` INTEGER NOT NULL DEFAULT 0,
    `fenetreDebutMmdd` VARCHAR(191) NULL,
    `fenetreFinMmdd` VARCHAR(191) NULL,
    `description` TEXT NULL,

    INDEX `ItineraireEtape_especeId_ordre_idx`(`especeId`, `ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Association` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especeId` INTEGER NOT NULL,
    `especeCibleId` INTEGER NOT NULL,
    `type` ENUM('favorable', 'deconseillee') NOT NULL,
    `notes` TEXT NULL,

    UNIQUE INDEX `Association_especeId_especeCibleId_type_key`(`especeId`, `especeCibleId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RisqueCulture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especeId` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `prevention` TEXT NULL,

    INDEX `RisqueCulture_especeId_idx`(`especeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faisabilite` (
    `especeId` INTEGER NOT NULL,
    `vocation` ENUM('serre_semis', 'tunnel', 'frais', 'maraichage', 'draine_ensoleille', 'grande_culture', 'autre') NOT NULL,
    `niveau` ENUM('vert', 'jaune', 'rouge') NOT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`especeId`, `vocation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotCulture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `especeId` INTEGER NOT NULL,
    `plancheId` INTEGER NOT NULL,
    `annee` INTEGER NOT NULL,
    `surfaceM2` DOUBLE NOT NULL,
    `priorite` ENUM('P1', 'P2', 'P3') NOT NULL DEFAULT 'P2',
    `rendementTHaFraisReel` DOUBLE NULL,
    `rendementKgHaSecReel` DOUBLE NULL,
    `notes` TEXT NULL,
    `etat` ENUM('prevu', 'seme', 'plante', 'en_croissance', 'en_recolte', 'termine', 'abandonne') NOT NULL DEFAULT 'prevu',
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LotCulture_plancheId_annee_idx`(`plancheId`, `annee`),
    INDEX `LotCulture_especeId_annee_idx`(`especeId`, `annee`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LotEtape` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lotId` INTEGER NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `code` ENUM('semis', 'plantation', 'recolte', 'taille', 'division', 'autre') NOT NULL,
    `libelle` VARCHAR(191) NULL,
    `dureeDepuisPrecedenteJours` INTEGER NOT NULL DEFAULT 0,
    `fenetreDebutMmdd` VARCHAR(191) NULL,
    `fenetreFinMmdd` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `datePrevue` DATE NULL,
    `verrouillee` BOOLEAN NOT NULL DEFAULT false,
    `decouplee` BOOLEAN NOT NULL DEFAULT false,
    `dateReelle` DATE NULL,
    `fait` BOOLEAN NOT NULL DEFAULT false,

    INDEX `LotEtape_lotId_ordre_idx`(`lotId`, `ordre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recolte` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lotId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `poidsKg` DOUBLE NOT NULL,
    `qualite` ENUM('A', 'B', 'C', 'autre') NOT NULL DEFAULT 'A',
    `qualiteNotes` VARCHAR(191) NULL,
    `numerosSacs` JSON NULL,
    `emplacement` VARCHAR(191) NULL,
    `datePeremption` DATE NULL,
    `campagneId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `operateurNom` VARCHAR(191) NULL,
    `matiereId` INTEGER NOT NULL,
    `stockMouvementId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Recolte_lotId_date_idx`(`lotId`, `date`),
    INDEX `Recolte_campagneId_idx`(`campagneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ItineraireEtape` ADD CONSTRAINT `ItineraireEtape_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Association` ADD CONSTRAINT `Association_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Association` ADD CONSTRAINT `Association_especeCibleId_fkey` FOREIGN KEY (`especeCibleId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RisqueCulture` ADD CONSTRAINT `RisqueCulture_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faisabilite` ADD CONSTRAINT `Faisabilite_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotCulture` ADD CONSTRAINT `LotCulture_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotCulture` ADD CONSTRAINT `LotCulture_plancheId_fkey` FOREIGN KEY (`plancheId`) REFERENCES `Planche`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LotEtape` ADD CONSTRAINT `LotEtape_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `LotCulture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recolte` ADD CONSTRAINT `Recolte_lotId_fkey` FOREIGN KEY (`lotId`) REFERENCES `LotCulture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recolte` ADD CONSTRAINT `Recolte_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
