-- CreateTable
CREATE TABLE `Espece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Espece_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matiere` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `nomLatin` VARCHAR(191) NULL,
    `provenance` ENUM('fermiere', 'importation', 'base') NOT NULL,
    `uniteAchat` ENUM('kg', 'L', 'piece') NOT NULL DEFAULT 'kg',
    `ratioSechage` DOUBLE NULL,
    `pctEau` DOUBLE NULL,
    `besoinEau` ENUM('faible', 'modere', 'eleve') NULL,
    `source` VARCHAR(191) NULL,
    `fournisseur` VARCHAR(191) NULL,
    `lien` VARCHAR(191) NULL,
    `prixVenteKg` DOUBLE NULL,
    `especeId` INTEGER NULL,
    `archivee` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Matiere_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MatierePrix` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matiereId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `prix` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MatierePrix_matiereId_date_idx`(`matiereId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorieReglementaire` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `lienFiche` VARCHAR(191) NULL,

    UNIQUE INDEX `CategorieReglementaire_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recette` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `tags` JSON NULL,
    `famille` ENUM('sec', 'sirop', 'sel', 'sucre', 'vinaigre', 'lacto', 'moutarde', 'tabasco', 'tisane', 'cosmetique', 'autre') NOT NULL,
    `type` ENUM('transformation', 'simple') NOT NULL DEFAULT 'transformation',
    `categorieId` INTEGER NULL,
    `modeQuantite` ENUM('proportions', 'absolu') NOT NULL DEFAULT 'proportions',
    `quantiteSortie` DOUBLE NULL,
    `uniteSortie` VARCHAR(191) NULL,
    `lotRefLibelle` VARCHAR(191) NULL,
    `rendementRatioTravail` DOUBLE NOT NULL DEFAULT 1,
    `notesVariante` TEXT NULL,
    `archivee` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Recette_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecetteIngredient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetteId` INTEGER NOT NULL,
    `matiereId` INTEGER NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `quantite` DOUBLE NOT NULL,
    `unite` VARCHAR(191) NOT NULL,
    `poidsEquivG` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EtapeRecette` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetteId` INTEGER NOT NULL,
    `ordre` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NOT NULL,
    `tempsMainOeuvre` INTEGER NOT NULL DEFAULT 0,
    `tempsAttente` INTEGER NOT NULL DEFAULT 0,
    `parametres` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Equipement_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EtapeEquipement` (
    `etapeId` INTEGER NOT NULL,
    `equipementId` INTEGER NOT NULL,

    PRIMARY KEY (`etapeId`, `equipementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conditionnement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `contenance` DOUBLE NULL,
    `poidsNet` DOUBLE NULL,
    `coutContenant` DOUBLE NOT NULL DEFAULT 0,
    `coutBouchon` DOUBLE NOT NULL DEFAULT 0,
    `coutEtiquette` DOUBLE NOT NULL DEFAULT 0,
    `coutTotal` DOUBLE NOT NULL DEFAULT 0,
    `lienContenant` VARCHAR(191) NULL,
    `lienBouchon` VARCHAR(191) NULL,
    `archive` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Conditionnement_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProduitFini` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recetteId` INTEGER NOT NULL,
    `conditionnementId` INTEGER NOT NULL,
    `poidsUnite` DOUBLE NOT NULL,
    `prixVenteUnite` DOUBLE NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parametres` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `tauxHoraireMainOeuvre` DOUBLE NOT NULL DEFAULT 0,
    `inclureMo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Matiere` ADD CONSTRAINT `Matiere_especeId_fkey` FOREIGN KEY (`especeId`) REFERENCES `Espece`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MatierePrix` ADD CONSTRAINT `MatierePrix_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recette` ADD CONSTRAINT `Recette_categorieId_fkey` FOREIGN KEY (`categorieId`) REFERENCES `CategorieReglementaire`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetteIngredient` ADD CONSTRAINT `RecetteIngredient_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecetteIngredient` ADD CONSTRAINT `RecetteIngredient_matiereId_fkey` FOREIGN KEY (`matiereId`) REFERENCES `Matiere`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapeRecette` ADD CONSTRAINT `EtapeRecette_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapeEquipement` ADD CONSTRAINT `EtapeEquipement_etapeId_fkey` FOREIGN KEY (`etapeId`) REFERENCES `EtapeRecette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EtapeEquipement` ADD CONSTRAINT `EtapeEquipement_equipementId_fkey` FOREIGN KEY (`equipementId`) REFERENCES `Equipement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProduitFini` ADD CONSTRAINT `ProduitFini_recetteId_fkey` FOREIGN KEY (`recetteId`) REFERENCES `Recette`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProduitFini` ADD CONSTRAINT `ProduitFini_conditionnementId_fkey` FOREIGN KEY (`conditionnementId`) REFERENCES `Conditionnement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
