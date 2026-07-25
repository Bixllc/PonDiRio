-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "pre_arrival_reminder_sent_at" TIMESTAMP(3),
ADD COLUMN     "check_in_reminder_sent_at" TIMESTAMP(3),
ADD COLUMN     "check_out_reminder_sent_at" TIMESTAMP(3);
