-- Rename scheduledAt column to scheduledTo and remove isPublished column from posts table
BEGIN;

-- First, drop the existing index on scheduledAt
DROP INDEX IF EXISTS "posts_scheduledAt_idx";

-- Add new scheduledTo column first
ALTER TABLE "public"."posts" ADD COLUMN "scheduledTo" TIMESTAMP(3);

-- Copy data from scheduledAt to scheduledTo
UPDATE "public"."posts" SET "scheduledTo" = "scheduledAt" WHERE "scheduledAt" IS NOT NULL;

-- Drop the old scheduledAt column
ALTER TABLE "public"."posts" DROP COLUMN "scheduledAt";

-- Remove isPublished column (data loss acceptable as we now use status)
ALTER TABLE "public"."posts" DROP COLUMN IF EXISTS "isPublished";

-- Create new index on scheduledTo
CREATE INDEX "posts_scheduledTo_idx" ON "public"."posts"("scheduledTo");

-- Drop the old isPublished index if it exists
DROP INDEX IF EXISTS "posts_isPublished_idx";

COMMIT;