/*
  Warnings:

  - The primary key for the `blog_post_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `blog_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."blog_post_translations" DROP CONSTRAINT "blog_post_translations_postId_fkey";

-- AlterTable
ALTER TABLE "public"."blog_post_translations" DROP CONSTRAINT "blog_post_translations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "postId" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "blog_post_translations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."blog_posts" DROP CONSTRAINT "blog_posts_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "referer" TEXT,
    "collectionPlace" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "linkedinId" TEXT,
    "linkedinAccessToken" TEXT,
    "linkedinRefreshToken" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "industry" TEXT,
    "goals" TEXT,
    "postingFrequency" TEXT,
    "contentStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_email_key" ON "public"."leads"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_linkedinId_key" ON "public"."users"("linkedinId");

-- AddForeignKey
ALTER TABLE "public"."blog_post_translations" ADD CONSTRAINT "blog_post_translations_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."blog_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
