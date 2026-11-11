-- AddRecoveryCode: one-time-use 2FA recovery codes (phase 2).
-- Additive table only; bcrypt hashes, never raw codes.
CREATE TABLE "RecoveryCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecoveryCode_userId_idx" ON "RecoveryCode"("userId");

ALTER TABLE "RecoveryCode" ADD CONSTRAINT "RecoveryCode_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "Customer"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
