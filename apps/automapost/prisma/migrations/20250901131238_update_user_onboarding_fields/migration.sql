/*
  Warnings:

  - You are about to drop the column `contentStyle` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `postingFrequency` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "contentStyle",
DROP COLUMN "goals",
DROP COLUMN "industry",
DROP COLUMN "postingFrequency",
ADD COLUMN     "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maxCommentsPerDay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "maxLikesPerDay" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "role" TEXT;
