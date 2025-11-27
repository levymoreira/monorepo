// Cookie configuration based on environment
export const getCookieConfig = (maxAge: number, path: string = '/') => {
  const isProduction = process.env.NODE_ENV === 'production';
  const disableSecure = process.env.DISABLE_SECURE_COOKIES === 'true';
  
  return {
    httpOnly: true,
    secure: isProduction && !disableSecure,
    sameSite: 'lax' as const,
    maxAge,
    path,
    // Don't set domain for localhost
    ...(isProduction ? {} : {})
  };
};
