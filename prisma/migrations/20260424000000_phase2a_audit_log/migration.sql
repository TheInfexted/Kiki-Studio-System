-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` ENUM('booking_created', 'booking_confirmed', 'booking_rejected', 'notify_sent', 'notify_failed') NOT NULL,
    `fromStatus` ENUM('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show') NULL,
    `toStatus` ENUM('pending', 'confirmed', 'rejected', 'completed', 'cancelled', 'no_show') NULL,
    `reason` TEXT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_bookingId_createdAt_idx`(`bookingId`, `createdAt`),
    INDEX `AuditLog_action_createdAt_idx`(`action`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill booking_created audit events for existing Phase 1 bookings
INSERT INTO `AuditLog` (`id`, `bookingId`, `action`, `toStatus`, `createdAt`)
SELECT
  CONCAT('bkfl_', b.id),
  b.id,
  'booking_created',
  'pending',
  b.createdAt
FROM `Booking` b
WHERE NOT EXISTS (
  SELECT 1 FROM `AuditLog` a
  WHERE a.bookingId = b.id AND a.action = 'booking_created'
);
