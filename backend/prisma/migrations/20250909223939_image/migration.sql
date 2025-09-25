-- AlterTable
ALTER TABLE `todos` ADD COLUMN `photoUrl` TEXT NULL;

-- CreateTable
CREATE TABLE `todo_permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `todoId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `canEdit` BOOLEAN NOT NULL DEFAULT false,
    `canDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `todo_permissions_todoId_userId_key`(`todoId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `todo_permissions` ADD CONSTRAINT `todo_permissions_todoId_fkey` FOREIGN KEY (`todoId`) REFERENCES `todos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `todo_permissions` ADD CONSTRAINT `todo_permissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
