/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `event_participations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `event_participations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_participations" DROP COLUMN "paymentStatus",
DROP COLUMN "status",
ADD COLUMN     "participationStatus" "ParticipationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "eventStatus" "EventStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "status",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
