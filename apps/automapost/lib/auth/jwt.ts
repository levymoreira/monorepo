import { SignJWT, jwtVerify, JWTPayload, importSPKI, importPKCS8 } from 'jose';
import { nanoid } from 'nanoid';

// JWT token types
export interface AccessTokenPayload extends JWTPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  sessionId: string;
  type: 'access';
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string; // user ID
  sessionId: string;
  tokenFamily: string;
  type: 'refresh';
}

// Load RSA keys (Edge-compatible). For now embed generated keys to ensure end-to-end works locally.
// Replace with env-based loading after validation if preferred.
const EMBEDDED_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCp8KvsJK8hAv2a
OKxHiYa8tjdKMJC86lZEhQmx1mfU0ZzTx9OkQ3HKUe0LmVRks8Kg5f84dnpv3xZc
meMw+HzVrCZtNYzC3lQFtOal0oN6NVS6tSYhB6OLBaM7D0s5vpD9oXzlLgMz/Gt1
YhXLVskZVEU7qkfuQ9mul4uxtN9MpPiCSwvtXOunspJnQv82rOzFzgnnuI3kTUgS
j4m03z1UUUOle/CBwrXWCHJjNXbxHPfbC2TPGu23GnhiofZJkAutDH4hDm8KF6lk
1m7OR3h3KHQBuyvpd/XuGDlajnsJyr7kPvL8cNlQLdZmlkKg9czCSkVnr3XB7SgE
UdxgfMP7AgMBAAECggEBAJkUhhm61dLb2cxBftcWCDwXu+hlpQu336vrV1dN9swb
YbTYDUqrwmXotKo9HWt1Dj5X0DZxa0s43vDdYm0reXAUmazIjxq+oVteoGIBJpRA
VCm3ojggpG5HzskVtsK2ae8+t73OW+5JVBcyGsXHUHEzmwXrFs6HaiA+vQSAFKH5
hQ+4rLJj+L596SdNMIESSVk3cppY/9J6nrYrKFLFVA1hbiqbUsAjt+nlqJw5Xhno
OWZ1xXWJ/MuXOTQWUh9Z3hXWg/utaTG15sZpQm7/1wIXBkxkOKGznx4aph64WDaV
dwOCowydHUS/b/jwmwZzVbzIvlPvJMowk6KF7oAivHkCgYEA2bCE0gSUr13F4TKE
n3yBADoAzLGBpwpENAadDw1GFRykLmaIqPqc5q2qcR4bSV1zFjnPhYEkuLV3qwcg
10rif+X6AODjqUCrNAvkfPVwdEaV+mwu7ZU2/reYB8RoepUmK8+PCK7lN+NkZaFW
486QtephL+SH8vcDuP+Gqhuij/cCgYEAx9jq44Tghe18n6Ev5unoXpz6p7Xn+D0X
FYa7tCs21GrooNJgoipisBbGt+lQRN3Rs4fjBh9r5DZT3PDvUAy7dawAcjw+ySNp
leh/WxGkMHOoAx/oTRCH7FNKjAeI7tUwqxms8T+uZElXoxADb+BwXyt9BkeoIC5j
NIZCV+4t8x0CgYBJZr3CWw0PfJ0GbBRP+pk8zFIMsyW2fz20FS7MLnudDsVFaAlY
gPh6x8Aa2D33JO1zZxbUO1F4fqfVIVgvf+6TlaYQucPKBCY2LHRkthWu/0X+5I+G
SLP8e0dmBxH7k2MFjrz5/o8Ho0LtCdPUiIg+7sLKdVJp2GSG8pIjtaHAzQKBgB73
arYkgdHe0b++bzi9p+b5NhHEqxQZCzmnrfAl/hH+GtvInXajULVuYg5fVbPGF1dV
SAVL2yD6lhYXM03ZGzcJluwcj7IFDbhP1WQcIK/tS+xoBkvist0YruVxyXMQj8ED
cnvTXUdm4fB/a7jrMx5cE7xkYBXUekTKRP9xBae1AoGAetx94tFe0qF/9IcLAbTo
DIPAVU7POD7uHiMsXEsr2HJByZvzlDwb0gkmd9VmzZNieDcaw3V+kca3TClv5DR/
Kq5QGCw7iRi0b+7PqpY1X4iGnLoMfyRzTKmAlUBFpv6f/wgcXu2FQBXp8eieQueW
WB1JGbfok3iimYadX3sAfS0=
-----END PRIVATE KEY-----`;

const EMBEDDED_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqfCr7CSvIQL9mjisR4mG
vLY3SjCQvOpWRIUJsdZn1NGc08fTpENxylHtC5lUZLPCoOX/OHZ6b98WXJnjMPh8
1awmbTWMwt5UBbTmpdKDejVUurUmIQejiwWjOw9LOb6Q/aF85S4DM/xrdWIVy1bJ
GVRFO6pH7kPZrpeLsbTfTKT4gksL7Vzrp7KSZ0L/Nqzsxc4J57iN5E1IEo+JtN89
VFFDpXvwgcK11ghyYzV28Rz32wtkzxrttxp4YqH2SZALrQx+IQ5vChepZNZuzkd4
dyh0Absr6Xf17hg5Wo57Ccq+5D7y/HDZUC3WZpZCoPXMwkpFZ691we0oBFHcYHzD
+wIDAQAB
-----END PUBLIC KEY-----`;

const getPrivateKey = () => EMBEDDED_PRIVATE_KEY_PEM;
const getPublicKey = () => EMBEDDED_PUBLIC_KEY_PEM;


// Convert PEM to KeyLike for jose
const pemToKeyLike = async (pem: string, type: 'private' | 'public') => {
  if (type === 'private') {
    return await importPKCS8(pem, 'RS256');
  } else {
    return await importSPKI(pem, 'RS256');
  }
};

// Token expiry configuration
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '1m'; // 1 month as per updated sisu.md

// Generate access token
export async function generateAccessToken(
  user: { id: string; email: string; name?: string },
  sessionId: string
): Promise<string> {
  // Always RS256 (single solution for prod and local)
  const keyLike = await pemToKeyLike(getPrivateKey(), 'private');
  
  const jwt = await new SignJWT({
    email: user.email,
    name: user.name,
    sessionId,
    type: 'access'
  } as Partial<AccessTokenPayload>)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER || 'https://automapost.com')
    .setAudience(process.env.JWT_AUDIENCE || 'https://api.automapost.com')
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setSubject(user.id)
    .setJti(nanoid())
    .sign(keyLike as any);
  
  return jwt;
}

// Generate refresh token
export async function generateRefreshToken(
  userId: string,
  sessionId: string,
  tokenFamily?: string
): Promise<string> {
  const keyLike = await pemToKeyLike(getPrivateKey(), 'private');
  
  const jwt = await new SignJWT({
    sessionId,
    tokenFamily: tokenFamily || nanoid(),
    type: 'refresh'
  } as Partial<RefreshTokenPayload>)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer(process.env.JWT_ISSUER || 'https://automapost.com')
    .setAudience(process.env.JWT_AUDIENCE || 'https://api.automapost.com')
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setSubject(userId)
    .setJti(nanoid())
    .sign(keyLike as any);
  
  return jwt;
}

// Verify and decode access token
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const key = await pemToKeyLike(getPublicKey(), 'public');
    
    const { payload } = await jwtVerify(token, key as any, {
      issuer: process.env.JWT_ISSUER || 'https://automapost.com',
      audience: process.env.JWT_AUDIENCE || 'https://api.automapost.com'
    });
    
    if (payload.type !== 'access') {
      return null;
    }
    
    return payload as AccessTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Verify and decode refresh token
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const key = await pemToKeyLike(getPublicKey(), 'public');
    
    const { payload } = await jwtVerify(token, key as any, {
      issuer: process.env.JWT_ISSUER || 'https://automapost.com',
      audience: process.env.JWT_AUDIENCE || 'https://api.automapost.com'
    });
    
    if (payload.type !== 'refresh') {
      return null;
    }
    
    return payload as RefreshTokenPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Extract token from Authorization header or cookie
export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const accessCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('automapost_access='));
  
  if (accessCookie) {
    return accessCookie.split('=')[1];
  }
  
  return null;
}

// Generate both access and refresh tokens
export async function generateTokenPair(
  user: { id: string; email: string; name?: string },
  sessionId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user, sessionId),
    generateRefreshToken(user.id, sessionId)
  ]);
  
  return { accessToken, refreshToken };
}
