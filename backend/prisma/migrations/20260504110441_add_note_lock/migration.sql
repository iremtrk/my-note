-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinHash" TEXT;
