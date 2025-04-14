-- CreateTable
CREATE TABLE `MJiraTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `JiraCode` VARCHAR(191) NOT NULL,
    `Desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
