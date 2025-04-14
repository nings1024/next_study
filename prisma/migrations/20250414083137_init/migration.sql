/*
  Warnings:

  - You are about to drop the `mjiratask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `mjiratask`;

-- CreateTable
CREATE TABLE `JiraTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `JiraCode` VARCHAR(191) NOT NULL,
    `Desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
