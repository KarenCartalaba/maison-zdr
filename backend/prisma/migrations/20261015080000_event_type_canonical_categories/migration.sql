-- Shrink EventType to the five canonical public categories (the same five
-- filters the Events page offers: Food / Arts / Games / Music / Performance).
--
-- A Postgres enum cannot be edited value-by-value in place when several old
-- values collapse onto one new value, so the column is rebuilt through a
-- temporary type. Every legacy row is remapped below — no row can violate the
-- new enum, and no event silently loses its category.
--
-- Legacy -> canonical remap (mirrors the filter shim that shipped with the
-- public category chips):
--   FORMAL   -> PERFORMANCE   ("Formel"   was listed under Performance)
--   CASUAL   -> PERFORMANCE   ("Décontracté" was listed under Performance)
--   SOCIAL   -> ARTS          (default value; was listed under Arts)
--   WORKSHOP -> ARTS          ("Atelier"  was listed under Arts)
--   LIVE_MUSIC -> MUSIC
--   FOOD_AND_DRINK -> FOOD
--   TRIVIA   -> GAMES
--   PRIVATE  -> FOOD          (documented choice: PRIVATE was orphaned — it
--                              never appeared under any category filter, only
--                              under "All". Maison ZDR's private hires are
--                              venue functions centred on food & drink, so
--                              they land under Food. Admins can reassign.)

-- 0. Cleanup guard: a previous failed apply may have left the temporary
--    type/column behind (DDL is not always transactional on pooled hosts).
--    Both are unused by the app, so dropping them is safe.
ALTER TABLE "Event" DROP COLUMN IF EXISTS "event_type_new";
DROP TYPE IF EXISTS "EventType_new";

-- 1. New enum type holding only the canonical categories.
CREATE TYPE "EventType_new" AS ENUM ('FOOD', 'ARTS', 'GAMES', 'MUSIC', 'PERFORMANCE');

-- 2. Temporary column typed with the new enum.
ALTER TABLE "Event" ADD COLUMN "event_type_new" "EventType_new";

-- 3. Backfill every existing row through the remap above. The CASE yields
--    text, so it is cast to the new enum type explicitly.
UPDATE "Event"
SET "event_type_new" = (CASE "event_type"
    WHEN 'FORMAL'         THEN 'PERFORMANCE'
    WHEN 'CASUAL'         THEN 'PERFORMANCE'
    WHEN 'SOCIAL'         THEN 'ARTS'
    WHEN 'WORKSHOP'       THEN 'ARTS'
    WHEN 'LIVE_MUSIC'     THEN 'MUSIC'
    WHEN 'FOOD_AND_DRINK' THEN 'FOOD'
    WHEN 'TRIVIA'         THEN 'GAMES'
    WHEN 'PRIVATE'        THEN 'FOOD'
    ELSE 'ARTS'
END)::"EventType_new";

-- 4. Swap the column over and retire the old type. The rebuilt column must go
--    back to NOT NULL exactly as the original one was (every row was backfilled
--    in step 3, so no NULL remains to block this).
ALTER TABLE "Event" DROP COLUMN "event_type";
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
ALTER TABLE "Event" RENAME COLUMN "event_type_new" TO "event_type";
ALTER TABLE "Event" ALTER COLUMN "event_type" SET NOT NULL;
ALTER TABLE "Event" ALTER COLUMN "event_type" SET DEFAULT 'ARTS';
DROP TYPE "EventType_old";
