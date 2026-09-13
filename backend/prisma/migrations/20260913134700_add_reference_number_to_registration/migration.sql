-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "reference_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_reference_number_key" ON "Registration"("reference_number");
