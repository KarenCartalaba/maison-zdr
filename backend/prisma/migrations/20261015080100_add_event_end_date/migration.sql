-- Reviews must open automatically when the event ENDS, so store an explicit
-- end datetime instead of inferring "finished" from the start date alone.
ALTER TABLE "Event" ADD COLUMN "end_date" TIMESTAMP(3);

-- Backfill every existing row: Maison ZDR events run for three hours, the
-- duration the event detail page already displays (start .. start + 3h).
UPDATE "Event" SET "end_date" = "event_date" + INTERVAL '3 hours' WHERE "end_date" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "end_date" SET NOT NULL;

-- The manual "allow reviews now" override is gone: review availability is
-- derived from end_date alone (see create-review-service.ts and
-- registration.repository.ts).
ALTER TABLE "Event" DROP COLUMN "allow_reviews_now";
