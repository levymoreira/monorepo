export interface OAuthProvider {
  name: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

export interface OAuthUserProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified?: boolean;
  provider: string;
}

// OAuth provider configurations
export const providers: Record<string, OAuthProvider> = {
  linkedin: {
    name: 'LinkedIn',
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback',
    scope: 'openid profile email'
  },
  google: {
    name: 'Google',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    scope: 'openid profile email'
  }
};

// Generate OAuth authorization URL
export function generateAuthUrl(provider: string, state: string): string {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: state
  });

  // LinkedIn specific parameters
  if (provider === 'linkedin') {
    params.append('response_mode', 'query');
  }

  // Google specific parameters
  if (provider === 'google') {
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  provider: string,
  code: string
): Promise<OAuthTokens> {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

// Get user profile from provider
export async function getUserProfile(
  provider: string,
  accessToken: string
): Promise<OAuthUserProfile> {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const response = await fetch(config.userInfoUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user profile: ${error}`);
  }

  const data = await response.json();

  // Normalize user profile data
  switch (provider) {
    case 'linkedin':
      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture,
        verified: data.email_verified,
        provider: 'linkedin'
      };

    case 'google':
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        verified: data.verified_email,
        provider: 'google'
      };

    default:
      throw new Error(`Profile parsing not implemented for provider: ${provider}`);
  }
}

// Refresh OAuth access token
export async function refreshAccessToken(
  provider: string,
  refreshToken: string
): Promise<OAuthTokens> {
  const config = providers[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  return response.json();
}
