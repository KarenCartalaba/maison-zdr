-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "guest_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "guest_names" TEXT[] DEFAULT ARRAY[]::TEXT[];
