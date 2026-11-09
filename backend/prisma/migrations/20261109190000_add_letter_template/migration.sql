-- CreateTable
CREATE TABLE "LetterTemplate" (
    "id" TEXT NOT NULL,
    "bureau" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LetterTemplate_bureau_key" ON "LetterTemplate"("bureau");
