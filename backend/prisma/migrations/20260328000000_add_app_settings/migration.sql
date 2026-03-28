-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "enableChapterView" BOOLEAN NOT NULL DEFAULT true,
    "enableSideReader" BOOLEAN NOT NULL DEFAULT false,
    "showPageNumbers" BOOLEAN NOT NULL DEFAULT true,
    "readingDirection" TEXT NOT NULL DEFAULT 'ltr',
    "pageFitMode" TEXT NOT NULL DEFAULT 'fit-width',
    "preloadNextPages" INTEGER NOT NULL DEFAULT 3,
    "autoMarkAsRead" BOOLEAN NOT NULL DEFAULT true,
    "defaultPageSize" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" DATETIME NOT NULL
);
