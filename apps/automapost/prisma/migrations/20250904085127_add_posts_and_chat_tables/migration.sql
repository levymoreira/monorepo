-- CreateTable
CREATE TABLE "public"."posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "firstComment" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "providers" TEXT[],
    "authProviderIds" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post_chats" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_userId_idx" ON "public"."posts"("userId");

-- CreateIndex
CREATE INDEX "posts_scheduledAt_idx" ON "public"."posts"("scheduledAt");

-- CreateIndex
CREATE INDEX "posts_isPublished_idx" ON "public"."posts"("isPublished");

-- CreateIndex
CREATE INDEX "posts_isDraft_idx" ON "public"."posts"("isDraft");

-- CreateIndex
CREATE INDEX "posts_deletedAt_idx" ON "public"."posts"("deletedAt");

-- CreateIndex
CREATE INDEX "post_chats_postId_idx" ON "public"."post_chats"("postId");

-- CreateIndex
CREATE INDEX "post_chats_userId_idx" ON "public"."post_chats"("userId");

-- CreateIndex
CREATE INDEX "post_chats_order_idx" ON "public"."post_chats"("order");

-- CreateIndex
CREATE INDEX "post_chats_deletedAt_idx" ON "public"."post_chats"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_chats" ADD CONSTRAINT "post_chats_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_chats" ADD CONSTRAINT "post_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
