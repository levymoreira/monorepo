CREATE TYPE "public"."Locale" AS ENUM('en', 'es', 'pt', 'br', 'fr');--> statement-breakpoint
CREATE TYPE "public"."PostStatus" AS ENUM('DRAFT', 'SCHEDULED', 'PENDING_APPROVAL', 'SENT');--> statement-breakpoint
CREATE TABLE "auth_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"expiresAt" timestamp with time zone,
	"scope" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_providers_provider_providerAccountId_key" UNIQUE("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "blog_post_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"locale" "Locale" NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"excerpt" text,
	"content" text NOT NULL,
	"metaTitle" text,
	"metaDescription" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_translations_postId_locale_key" UNIQUE("postId","locale"),
	CONSTRAINT "blog_post_translations_locale_slug_key" UNIQUE("locale","slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"isPublished" boolean DEFAULT true NOT NULL,
	"publishedAt" timestamp with time zone,
	"authorName" text DEFAULT 'AutomaPost Team' NOT NULL,
	"coverImageUrl" text,
	"readMinutes" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"error" text NOT NULL,
	"errorType" text DEFAULT 'javascript' NOT NULL,
	"severity" text DEFAULT 'error' NOT NULL,
	"url" text,
	"userAgent" text,
	"userId" uuid,
	"sessionId" text,
	"metadata" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"referer" text,
	"collectionPlace" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "message_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"postId" uuid NOT NULL,
	"messageId" uuid NOT NULL,
	"delivered" boolean DEFAULT false NOT NULL,
	"deliveredAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"postId" uuid NOT NULL,
	"userId" uuid,
	"role" text DEFAULT 'user' NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"status" text DEFAULT 'sent' NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"content" text NOT NULL,
	"firstComment" text,
	"scheduledTo" timestamp with time zone,
	"publishedAt" timestamp with time zone,
	"status" "PostStatus" DEFAULT 'DRAFT' NOT NULL,
	"providers" text[] DEFAULT '{}' NOT NULL,
	"authProviderIds" text[] DEFAULT '{}' NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"sessionToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"deviceFingerprint" text,
	"accessTokenExpires" timestamp with time zone NOT NULL,
	"refreshTokenExpires" timestamp with time zone NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"revokedAt" timestamp with time zone,
	"revokedReason" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastActivityAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken"),
	CONSTRAINT "sessions_refreshToken_unique" UNIQUE("refreshToken")
);
--> statement-breakpoint
CREATE TABLE "sisu_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"email" text NOT NULL,
	"action" text NOT NULL,
	"provider" text NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"browser" text,
	"browserVersion" text,
	"os" text,
	"osVersion" text,
	"device" text,
	"deviceType" text,
	"deviceFingerprint" text,
	"country" text,
	"city" text,
	"language" text,
	"timezone" text,
	"referer" text,
	"success" boolean DEFAULT true NOT NULL,
	"errorMessage" text,
	"sessionId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password" text,
	"avatarUrl" text,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"linkedinId" text,
	"linkedinAccessToken" text,
	"linkedinRefreshToken" text,
	"role" text,
	"interests" text[] DEFAULT '{}' NOT NULL,
	"maxCommentsPerDay" integer DEFAULT 5 NOT NULL,
	"maxLikesPerDay" integer DEFAULT 10 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_linkedinId_unique" UNIQUE("linkedinId")
);
--> statement-breakpoint
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_post_translations" ADD CONSTRAINT "blog_post_translations_postId_blog_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."blog_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_errors" ADD CONSTRAINT "client_errors_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_queue" ADD CONSTRAINT "message_queue_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_queue" ADD CONSTRAINT "message_queue_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_queue" ADD CONSTRAINT "message_queue_messageId_post_chat_messages_id_fk" FOREIGN KEY ("messageId") REFERENCES "public"."post_chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_chat_messages" ADD CONSTRAINT "post_chat_messages_postId_posts_id_fk" FOREIGN KEY ("postId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_chat_messages" ADD CONSTRAINT "post_chat_messages_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sisu_activities" ADD CONSTRAINT "sisu_activities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_providers_userId_idx" ON "auth_providers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "blog_post_translations_locale_slug_idx" ON "blog_post_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE INDEX "client_errors_createdAt_idx" ON "client_errors" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "client_errors_errorType_idx" ON "client_errors" USING btree ("errorType");--> statement-breakpoint
CREATE INDEX "client_errors_severity_idx" ON "client_errors" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "client_errors_userId_idx" ON "client_errors" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "message_queue_userId_postId_delivered_createdAt_idx" ON "message_queue" USING btree ("userId","postId","delivered","createdAt");--> statement-breakpoint
CREATE INDEX "post_chat_messages_postId_createdAt_idx" ON "post_chat_messages" USING btree ("postId","createdAt");--> statement-breakpoint
CREATE INDEX "post_chat_messages_userId_idx" ON "post_chat_messages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "post_chat_messages_deletedAt_idx" ON "post_chat_messages" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "posts_userId_idx" ON "posts" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "posts_scheduledTo_idx" ON "posts" USING btree ("scheduledTo");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_deletedAt_idx" ON "posts" USING btree ("deletedAt");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sessions_sessionToken_idx" ON "sessions" USING btree ("sessionToken");--> statement-breakpoint
CREATE INDEX "sessions_refreshToken_idx" ON "sessions" USING btree ("refreshToken");--> statement-breakpoint
CREATE INDEX "sessions_isActive_idx" ON "sessions" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "sisu_activities_userId_idx" ON "sisu_activities" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "sisu_activities_email_idx" ON "sisu_activities" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sisu_activities_createdAt_idx" ON "sisu_activities" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "sisu_activities_action_idx" ON "sisu_activities" USING btree ("action");