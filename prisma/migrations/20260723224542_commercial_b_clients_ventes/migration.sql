-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `type` ENUM('particulier', 'professionnel', 'association', 'autre') NULL,
    `contactNom` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `adresse` VARCHAR(191) NULL,
    `codePostal` VARCHAR(191) NULL,
    `ville` VARCHAR(191) NULL,
    `conditionsLivraison` TEXT NULL,
    `notes` TEXT NULL,
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `texte` TEXT NOT NULL,
    `operateurNom` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointVente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `type` ENUM('ferme', 'marche', 'boutique_producteur', 'demi_gros', 'tournee', 'autre') NOT NULL,
    `contact` VARCHAR(191) NULL,
    `joursLivraisonHabituels` JSON NULL,
    `notes` TEXT NULL,
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PointVente_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `pointVenteId` INTEGER NOT NULL,
    `dateCommande` DATE NOT NULL,
    `dateLivraison` DATE NOT NULL,
    `statut` ENUM('brouillon', 'confirmee', 'preparee', 'livree', 'annulee') NOT NULL DEFAULT 'brouillon',
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `operateurNom` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommandeLigne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commandeId` INTEGER NOT NULL,
    `produitFiniId` INTEGER NOT NULL,
    `quantite` DOUBLE NOT NULL,
    `prixUnitaire` DOUBLE NOT NULL,
    `montant` DOUBLE NOT NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntentionVente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produitFiniId` INTEGER NOT NULL,
    `annee` INTEGER NOT NULL,
    `unitesVisees` DOUBLE NOT NULL,
    `priorite` ENUM('P1', 'P2', 'P3') NOT NULL DEFAULT 'P2',
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `IntentionVente_produitFiniId_annee_key`(`produitFiniId`, `annee`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VenteLigne` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `produitFiniId` INTEGER NOT NULL,
    `pointVenteId` INTEGER NOT NULL,
    `clientId` INTEGER NULL,
    `quantite` DOUBLE NOT NULL,
    `prixUnitaire` DOUBLE NOT NULL,
    `montant` DOUBLE NOT NULL,
    `statut` ENUM('validee', 'annulee') NOT NULL DEFAULT 'validee',
    `source` ENUM('directe', 'commande') NOT NULL,
    `commandeId` INTEGER NULL,
    `commandeLigneId` INTEGER NULL,
    `operateurNom` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientNote` ADD CONSTRAINT `ClientNote_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_pointVenteId_fkey` FOREIGN KEY (`pointVenteId`) REFERENCES `PointVente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommandeLigne` ADD CONSTRAINT `CommandeLigne_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommandeLigne` ADD CONSTRAINT `CommandeLigne_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `ProduitFini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IntentionVente` ADD CONSTRAINT `IntentionVente_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `ProduitFini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteLigne` ADD CONSTRAINT `VenteLigne_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `ProduitFini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteLigne` ADD CONSTRAINT `VenteLigne_pointVenteId_fkey` FOREIGN KEY (`pointVenteId`) REFERENCES `PointVente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteLigne` ADD CONSTRAINT `VenteLigne_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteLigne` ADD CONSTRAINT `VenteLigne_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteLigne` ADD CONSTRAINT `VenteLigne_commandeLigneId_fkey` FOREIGN KEY (`commandeLigneId`) REFERENCES `CommandeLigne`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
