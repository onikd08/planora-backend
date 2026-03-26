/*
  Warnings:

  - You are about to drop the column `endDate` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_event_date";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "endDate",
DROP COLUMN "startDate";
