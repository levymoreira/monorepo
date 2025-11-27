ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "readMinutes" INTEGER;

-- Seed a sensible default read time for existing posts
UPDATE "blog_posts" SET "readMinutes" = COALESCE("readMinutes", 8);


