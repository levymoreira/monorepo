-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PENDING_APPROVAL', 'SENT');

-- AlterTable: Add the new status column with a default value
ALTER TABLE "posts" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'DRAFT';

-- Data migration: Set status based on existing isDraft and other fields
UPDATE "posts" SET "status" = CASE 
  WHEN "isDraft" = true THEN 'DRAFT'::"PostStatus"
  WHEN "isPublished" = true THEN 'SENT'::"PostStatus"
  WHEN "scheduledAt" IS NOT NULL AND "scheduledAt" > NOW() THEN 'SCHEDULED'::"PostStatus"
  ELSE 'DRAFT'::"PostStatus"
END;

-- DropIndex
DROP INDEX "posts_isDraft_idx";

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- AlterTable: Drop the old isDraft column
ALTER TABLE "posts" DROP COLUMN "isDraft";