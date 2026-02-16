-- DropIndex
DROP INDEX "ReadingHistory_mangaId_key";

-- CreateIndex
CREATE INDEX "ReadingHistory_mangaId_idx" ON "ReadingHistory"("mangaId");
