import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  varchar,
  pgEnum,
  index,
  unique,
  json
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const localeEnum = pgEnum('Locale', ['en', 'es', 'pt', 'br', 'fr']);
export const postStatusEnum = pgEnum('PostStatus', ['DRAFT', 'SCHEDULED', 'PENDING_APPROVAL', 'SENT']);

// Leads table
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  referer: text('referer'),
  collectionPlace: text('collectionPlace').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  password: text('password'), // hashed password for email/password auth
  avatarUrl: text('avatarUrl'),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  onboardingCompleted: boolean('onboardingCompleted').default(false).notNull(),
  
  // Password reset
  resetPasswordToken: text('resetPasswordToken'),
  resetPasswordExpires: timestamp('resetPasswordExpires', { withTimezone: true }),
  
  // Legacy LinkedIn fields
  linkedinId: text('linkedinId').unique(),
  linkedinAccessToken: text('linkedinAccessToken'),
  linkedinRefreshToken: text('linkedinRefreshToken'),
  
  // Onboarding preferences
  role: text('role'),
  interests: text('interests').array().default([]).notNull(),
  maxCommentsPerDay: integer('maxCommentsPerDay').default(5).notNull(),
  maxLikesPerDay: integer('maxLikesPerDay').default(10).notNull(),
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// Auth Providers table
export const authProviders = pgTable('auth_providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'linkedin', 'google', 'instagram', 'tiktok'
  providerAccountId: text('providerAccountId').notNull(),
  
  // OAuth tokens
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  expiresAt: timestamp('expiresAt', { withTimezone: true }),
  scope: text('scope'),
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  unique('auth_providers_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
  index('auth_providers_userId_idx').on(table.userId),
]);

// Sessions table
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('sessionToken').notNull().unique(),
  refreshToken: text('refreshToken').notNull().unique(),
  
  // Session metadata
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  deviceFingerprint: text('deviceFingerprint'),
  
  // Expiration
  accessTokenExpires: timestamp('accessTokenExpires', { withTimezone: true }).notNull(),
  refreshTokenExpires: timestamp('refreshTokenExpires', { withTimezone: true }).notNull(),
  
  // Status
  isActive: boolean('isActive').default(true).notNull(),
  revokedAt: timestamp('revokedAt', { withTimezone: true }),
  revokedReason: text('revokedReason'),
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
  lastActivityAt: timestamp('lastActivityAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sessions_userId_idx').on(table.userId),
  index('sessions_sessionToken_idx').on(table.sessionToken),
  index('sessions_refreshToken_idx').on(table.refreshToken),
  index('sessions_isActive_idx').on(table.isActive),
]);

// SISU Activities table
export const sisuActivities = pgTable('sisu_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').references(() => users.id),
  email: text('email').notNull(),
  action: text('action').notNull(), // 'signup', 'signin', 'signout', etc.
  provider: text('provider').notNull(),
  
  // Browser/Device Info
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  browser: text('browser'),
  browserVersion: text('browserVersion'),
  os: text('os'),
  osVersion: text('osVersion'),
  device: text('device'),
  deviceType: text('deviceType'), // 'desktop', 'mobile', 'tablet'
  deviceFingerprint: text('deviceFingerprint'),
  
  // Location/Language Info
  country: text('country'),
  city: text('city'),
  language: text('language'),
  timezone: text('timezone'),
  
  // Additional Context
  referer: text('referer'),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('errorMessage'),
  sessionId: text('sessionId'),
  
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sisu_activities_userId_idx').on(table.userId),
  index('sisu_activities_email_idx').on(table.email),
  index('sisu_activities_createdAt_idx').on(table.createdAt),
  index('sisu_activities_action_idx').on(table.action),
]);

// Blog Posts table
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  isPublished: boolean('isPublished').default(true).notNull(),
  publishedAt: timestamp('publishedAt', { withTimezone: true }),
  authorName: text('authorName').default('AutomaPost Team').notNull(),
  coverImageUrl: text('coverImageUrl'),
  readMinutes: integer('readMinutes'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// Blog Post Translations table
export const blogPostTranslations = pgTable('blog_post_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('postId').notNull().references(() => blogPosts.id),
  locale: localeEnum('locale').notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  category: text('category'),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  metaTitle: text('metaTitle'),
  metaDescription: text('metaDescription'),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  unique('blog_post_translations_postId_locale_key').on(table.postId, table.locale),
  unique('blog_post_translations_locale_slug_key').on(table.locale, table.slug),
  index('blog_post_translations_locale_slug_idx').on(table.locale, table.slug),
]);

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Post content
  content: text('content').notNull(),
  firstComment: text('firstComment'),
  
  // Scheduling
  scheduledTo: timestamp('scheduledTo', { withTimezone: true }),
  publishedAt: timestamp('publishedAt', { withTimezone: true }),
  
  // Status
  status: postStatusEnum('status').default('DRAFT').notNull(),
  
  // Linked auth providers
  providers: text('providers').array().default([]).notNull(),
  authProviderIds: text('authProviderIds').array().default([]).notNull(),
  
  // Soft delete
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('posts_userId_idx').on(table.userId),
  index('posts_scheduledTo_idx').on(table.scheduledTo),
  index('posts_status_idx').on(table.status),
  index('posts_deletedAt_idx').on(table.deletedAt),
]);

// Post Chat Messages table
export const postChatMessages = pgTable('post_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('userId').references(() => users.id, { onDelete: 'cascade' }),
  
  // Message details
  role: text('role').default('user').notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  metadata: json('metadata'),
  status: text('status').default('sent').notNull(), // 'sending', 'sent', 'failed'
  
  // Soft delete
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => [
  index('post_chat_messages_postId_createdAt_idx').on(table.postId, table.createdAt),
  index('post_chat_messages_userId_idx').on(table.userId),
  index('post_chat_messages_deletedAt_idx').on(table.deletedAt),
]);

// Message Queue table
export const messageQueue = pgTable('message_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('postId').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  messageId: uuid('messageId').notNull().references(() => postChatMessages.id, { onDelete: 'cascade' }),
  
  // Delivery tracking
  delivered: boolean('delivered').default(false).notNull(),
  deliveredAt: timestamp('deliveredAt', { withTimezone: true }),
  
  // Timestamps
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('message_queue_userId_postId_delivered_createdAt_idx').on(table.userId, table.postId, table.delivered, table.createdAt),
]);

// Client Errors table
export const clientErrors = pgTable('client_errors', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Core error information
  error: text('error').notNull(),
  errorType: text('errorType').default('javascript').notNull(),
  severity: text('severity').default('error').notNull(),
  
  // Context information
  url: text('url'),
  userAgent: text('userAgent'),
  userId: uuid('userId').references(() => users.id),
  sessionId: text('sessionId'),
  
  // Additional metadata
  metadata: json('metadata'),
  
  // Timestamps
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('client_errors_createdAt_idx').on(table.createdAt),
  index('client_errors_errorType_idx').on(table.errorType),
  index('client_errors_severity_idx').on(table.severity),
  index('client_errors_userId_idx').on(table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  authProviders: many(authProviders),
  sessions: many(sessions),
  sisuActivities: many(sisuActivities),
  posts: many(posts),
  postChatMessages: many(postChatMessages),
  messageQueue: many(messageQueue),
  clientErrors: many(clientErrors),
}));

export const authProvidersRelations = relations(authProviders, ({ one }) => ({
  user: one(users, {
    fields: [authProviders.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const sisuActivitiesRelations = relations(sisuActivities, ({ one }) => ({
  user: one(users, {
    fields: [sisuActivities.userId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  translations: many(blogPostTranslations),
}));

export const blogPostTranslationsRelations = relations(blogPostTranslations, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTranslations.postId],
    references: [blogPosts.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  chatMessages: many(postChatMessages),
  messageQueue: many(messageQueue),
}));

export const postChatMessagesRelations = relations(postChatMessages, ({ one, many }) => ({
  post: one(posts, {
    fields: [postChatMessages.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postChatMessages.userId],
    references: [users.id],
  }),
  messageQueue: many(messageQueue),
}));

export const messageQueueRelations = relations(messageQueue, ({ one }) => ({
  user: one(users, {
    fields: [messageQueue.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [messageQueue.postId],
    references: [posts.id],
  }),
  message: one(postChatMessages, {
    fields: [messageQueue.messageId],
    references: [postChatMessages.id],
  }),
}));

export const clientErrorsRelations = relations(clientErrors, ({ one }) => ({
  user: one(users, {
    fields: [clientErrors.userId],
    references: [users.id],
  }),
}));

// Type exports for use throughout the app
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AuthProvider = typeof authProviders.$inferSelect;
export type NewAuthProvider = typeof authProviders.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type SisuActivity = typeof sisuActivities.$inferSelect;
export type NewSisuActivity = typeof sisuActivities.$inferInsert;

export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;

export type BlogPostTranslation = typeof blogPostTranslations.$inferSelect;
export type NewBlogPostTranslation = typeof blogPostTranslations.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostChatMessage = typeof postChatMessages.$inferSelect;
export type NewPostChatMessage = typeof postChatMessages.$inferInsert;

export type MessageQueueItem = typeof messageQueue.$inferSelect;
export type NewMessageQueueItem = typeof messageQueue.$inferInsert;

export type ClientError = typeof clientErrors.$inferSelect;
export type NewClientError = typeof clientErrors.$inferInsert;

// Locale type export
export type Locale = 'en' | 'es' | 'pt' | 'br' | 'fr';
