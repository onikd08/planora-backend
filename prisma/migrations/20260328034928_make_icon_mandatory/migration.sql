/*
  Warnings:

  - Made the column `icon` on table `event_categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "event_categories" ALTER COLUMN "icon" SET NOT NULL;
