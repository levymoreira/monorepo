ALTER TABLE "users" ADD COLUMN "resetPasswordToken" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetPasswordExpires" timestamp with time zone;