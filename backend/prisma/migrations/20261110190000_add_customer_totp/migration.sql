-- AddCustomerTotp: additive columns, no data touched
ALTER TABLE "Customer" ADD COLUMN "totpSecret" TEXT;
ALTER TABLE "Customer" ADD COLUMN "totpConfirmed" BOOLEAN NOT NULL DEFAULT false;
