/*
  Warnings:

  - A unique constraint covering the columns `[mangaId]` on the table `ReadingHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ReadingHistory_mangaId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ReadingHistory_mangaId_key" ON "ReadingHistory"("mangaId");
