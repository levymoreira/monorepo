export const locales = [
  { code: 'en', name: 'English', region: 'US', flag: '🇺🇸' },
  { code: 'es', name: 'Español', region: 'ES', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', region: 'PT', flag: '🇵🇹' },
  { code: 'br', name: 'Português', region: 'BR', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', region: 'FR', flag: '🇫🇷' }
] as const;

export type Locale = typeof locales[number]['code'];

export const defaultLocale: Locale = 'en';

export const localePrefix = 'as-needed';