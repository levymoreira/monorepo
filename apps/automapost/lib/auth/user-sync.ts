import { db as prisma } from '@/lib/db';
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
  const existingAuthProvider = await prisma.authProvider.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId
      }
    },
    include: {
      user: true
    }
  });

  if (existingAuthProvider) {
    // Update tokens
    await prisma.authProvider.update({
      where: { id: existingAuthProvider.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope
      }
    });

    // Update user info if changed
    if (existingAuthProvider.user.name !== name || existingAuthProvider.user.avatarUrl !== avatarUrl) {
      await prisma.user.update({
        where: { id: existingAuthProvider.user.id },
        data: {
          name: name || existingAuthProvider.user.name,
          avatarUrl: avatarUrl || existingAuthProvider.user.avatarUrl
        }
      });
    }

    return { user: existingAuthProvider.user, isNew: false };
  }

  // Check if user exists with same email
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Link new provider to existing user
    await prisma.authProvider.create({
      data: {
        userId: existingUser.id,
        provider,
        providerAccountId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope
      }
    });

    // Update user info if missing
    if (!existingUser.name || !existingUser.avatarUrl) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          avatarUrl: avatarUrl || existingUser.avatarUrl,
          emailVerified: true // OAuth providers verify emails
        }
      });
    }

    return { user: existingUser, isNew: false };
  }

  // Create new user and auth provider
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      avatarUrl,
      emailVerified: true, // OAuth providers verify emails
      authProviders: {
        create: {
          provider,
          providerAccountId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : null,
          scope: tokens.scope
        }
      }
    },
    include: {
      authProviders: true
    }
  });

  // Note: Lead creation removed - users are already added to leads 
  // during initial signup form submission before reaching onboarding

  return { user: newUser, isNew: true };
}

// Get user by ID with auth providers
export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      authProviders: {
        select: {
          provider: true,
          createdAt: true
        }
      }
    }
  });
}

// Get user's auth provider tokens
export async function getUserAuthProvider(userId: string, provider: string) {
  return prisma.authProvider.findFirst({
    where: {
      userId,
      provider
    }
  });
}

// Update auth provider tokens
export async function updateAuthProviderTokens(
  authProviderId: string,
  tokens: Partial<OAuthTokens>
) {
  return prisma.authProvider.update({
    where: { id: authProviderId },
    data: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
      scope: tokens.scope
    }
  });
}

// Disconnect auth provider
export async function disconnectAuthProvider(userId: string, provider: string) {
  // Check if user has other auth methods
  const authProviders = await prisma.authProvider.count({
    where: { userId }
  });

  if (authProviders <= 1) {
    throw new Error('Cannot disconnect the only authentication method');
  }

  return prisma.authProvider.deleteMany({
    where: {
      userId,
      provider
    }
  });
}

// Check if user has completed onboarding
export async function checkUserOnboarding(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true }
  });

  return user?.onboardingCompleted || false;
}
