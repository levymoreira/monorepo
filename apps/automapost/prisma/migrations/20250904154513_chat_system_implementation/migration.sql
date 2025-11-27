/*
  Warnings:

  - You are about to drop the `post_chats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."post_chats" DROP CONSTRAINT "post_chats_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."post_chats" DROP CONSTRAINT "post_chats_userId_fkey";

-- DropTable
DROP TABLE "public"."post_chats";

-- CreateTable
CREATE TABLE "public"."post_chat_messages" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_chat_messages_postId_createdAt_idx" ON "public"."post_chat_messages"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "post_chat_messages_userId_idx" ON "public"."post_chat_messages"("userId");

-- CreateIndex
CREATE INDEX "post_chat_messages_deletedAt_idx" ON "public"."post_chat_messages"("deletedAt");

-- CreateIndex
CREATE INDEX "message_queue_userId_postId_delivered_createdAt_idx" ON "public"."message_queue"("userId", "postId", "delivered", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."post_chat_messages" ADD CONSTRAINT "post_chat_messages_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post_chat_messages" ADD CONSTRAINT "post_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_queue" ADD CONSTRAINT "message_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_queue" ADD CONSTRAINT "message_queue_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message_queue" ADD CONSTRAINT "message_queue_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."post_chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
