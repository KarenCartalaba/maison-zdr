-- Canonical venue backfill: every event must carry Maison ZDR's real address
-- ("9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes, France") unless it has
-- a genuine custom venue. Placeholder / empty values are replaced so no card,
-- detail page or printed list ever shows "Bar & Lounge" or a blank venue.
UPDATE "Event"
SET "location" = '9 Rue du Commerce, 35140 Saint-Hilaire-des-Landes, France'
WHERE "location" IS NULL
   OR btrim("location") = ''
   OR lower(btrim("location")) IN (
     'bar & lounge',
     'bar and lounge',
     'lounge',
     'maison zdr',
     'maison zdr bar',
     'venue',
     'tbd',
     'n/a',
     'na',
     'to be determined',
     'to be defined',
     'unknown'
   );
