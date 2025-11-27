import { db, users, authProviders } from '@/lib/db';
import { eq, and, count } from 'drizzle-orm';
import { OAuthUserProfile, OAuthTokens } from './providers/config';

interface UserSyncResult {
  user: any;
  isNew: boolean;
}

// Find or create user from OAuth profile
export async function findOrCreateUser(params: {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  tokens: OAuthTokens;
}): Promise<UserSyncResult> {
  const { provider, providerAccountId, email, name, avatarUrl, tokens } = params;

  // First, try to find existing auth provider
  const [existingAuthProvider] = await db.select()
    .from(authProviders)
    .leftJoin(users, eq(authProviders.userId, users.id))
    .where(and(
      eq(authProviders.provider, provider),
      eq(authProviders.providerAccountId, providerAccountId)
    ))
    .limit(1);

  if (existingAuthProvider?.auth_providers) {
    // Update tokens
    await db.update(authProviders)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope
      })
      .where(eq(authProviders.id, existingAuthProvider.auth_providers.id));

    // Update user info if changed
    if (existingAuthProvider.users && (existingAuthProvider.users.name !== name || existingAuthProvider.users.avatarUrl !== avatarUrl)) {
      await db.update(users)
        .set({
          name: name || existingAuthProvider.users.name,
          avatarUrl: avatarUrl || existingAuthProvider.users.avatarUrl
        })
        .where(eq(users.id, existingAuthProvider.users.id));
    }

    return { user: existingAuthProvider.users, isNew: false };
  }

  // Check if user exists with same email
  const [existingUser] = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    // Link new provider to existing user
    await db.insert(authProviders).values({
      userId: existingUser.id,
      provider,
      providerAccountId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : null,
      scope: tokens.scope
    });

    // Update user info if missing
    if (!existingUser.name || !existingUser.avatarUrl) {
      await db.update(users)
        .set({
          name: name || existingUser.name,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
          emailVerified: true // OAuth providers verify emails
        })
        .where(eq(users.id, existingUser.id));
    }

    return { user: existingUser, isNew: false };
  }

  // Create new user and auth provider
  const [newUser] = await db.insert(users).values({
    email,
    name,
    avatarUrl,
    emailVerified: true, // OAuth providers verify emails
  }).returning();

  await db.insert(authProviders).values({
    userId: newUser.id,
    provider,
    providerAccountId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in 
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null,
    scope: tokens.scope
  });

  // Note: Lead creation removed - users are already added to leads 
  // during initial signup form submission before reaching onboarding

  return { user: newUser, isNew: true };
}

// Get user by ID with auth providers
export async function getUserById(userId: string) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user) return null;
  
  const providers = await db.select({
    provider: authProviders.provider,
    createdAt: authProviders.createdAt
  })
  .from(authProviders)
  .where(eq(authProviders.userId, userId));
  
  return { ...user, authProviders: providers };
}

// Get user's auth provider tokens
export async function getUserAuthProvider(userId: string, provider: string) {
  const [authProvider] = await db.select()
    .from(authProviders)
    .where(and(
      eq(authProviders.userId, userId),
      eq(authProviders.provider, provider)
    ))
    .limit(1);
  
  return authProvider || null;
}

// Update auth provider tokens
export async function updateAuthProviderTokens(
  authProviderId: string,
  tokens: Partial<OAuthTokens>
) {
  return db.update(authProviders)
    .set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
      scope: tokens.scope
    })
    .where(eq(authProviders.id, authProviderId));
}

// Disconnect auth provider
export async function disconnectAuthProvider(userId: string, provider: string) {
  // Check if user has other auth methods
  const [result] = await db.select({ count: count() })
    .from(authProviders)
    .where(eq(authProviders.userId, userId));

  if ((result?.count || 0) <= 1) {
    throw new Error('Cannot disconnect the only authentication method');
  }

  return db.delete(authProviders)
    .where(and(
      eq(authProviders.userId, userId),
      eq(authProviders.provider, provider)
    ));
}

// Check if user has completed onboarding
export async function checkUserOnboarding(userId: string): Promise<boolean> {
  const [user] = await db.select({ onboardingCompleted: users.onboardingCompleted })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.onboardingCompleted || false;
}
