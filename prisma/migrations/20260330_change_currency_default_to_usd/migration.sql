-- Change default currency from XCD to USD
ALTER TABLE "bookings" ALTER COLUMN "currency" SET DEFAULT 'USD';
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- Update any existing records that still have XCD
UPDATE "bookings" SET "currency" = 'USD' WHERE "currency" = 'XCD';
UPDATE "payments" SET "currency" = 'USD' WHERE "currency" = 'XCD';
