/*
  Warnings:

  - You are about to drop the column `isLocked` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `pinHash` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "isLocked",
DROP COLUMN "pinHash";

-- CreateTable
CREATE TABLE "NoteLock" (
    "id" SERIAL NOT NULL,
    "noteId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "pinHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteLock_noteId_userId_key" ON "NoteLock"("noteId", "userId");

-- AddForeignKey
ALTER TABLE "NoteLock" ADD CONSTRAINT "NoteLock_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteLock" ADD CONSTRAINT "NoteLock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
