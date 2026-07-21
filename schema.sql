-- Hanzo Base schema for Dropmark (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped: the collection rule `@request.auth.org_id = org` lets a member of
-- your org read/write it while other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/views/admin.tsx and src/views/smartlink.tsx).

-- The release this smart link is for (the app manages the most recent row).
CREATE TABLE IF NOT EXISTS release (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  release_date TEXT
);

-- One streaming button per row; `clicks` counts fan taps on the smart link.
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0
);
