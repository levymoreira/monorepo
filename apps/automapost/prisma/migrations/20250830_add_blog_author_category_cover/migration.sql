-- Add columns to blog_posts
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "authorName" TEXT NOT NULL DEFAULT 'AutomaPost Team';
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;

-- Add category to translations
ALTER TABLE "blog_post_translations" ADD COLUMN IF NOT EXISTS "category" TEXT;

-- Seed categories and cover images for existing example post translations
UPDATE "blog_posts"
SET "authorName" = 'AutomaPost Team',
    "coverImageUrl" = COALESCE("coverImageUrl", '/linkedin-user1.png')
WHERE "id" IN (SELECT DISTINCT "postId" FROM "blog_post_translations");

UPDATE "blog_post_translations"
SET "category" = COALESCE("category", 'Vibe Coding')
WHERE "category" IS NULL;


