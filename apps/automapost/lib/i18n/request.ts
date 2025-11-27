import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {defaultLocale, locales} from './config';
import type {Locale} from './config';

export default getRequestConfig(async (params) => {
  const locale = params.locale || await params.requestLocale;
  
  // Validate that the incoming `locale` parameter is valid
  const validLocales = locales.map(l => l.code);
  
  if (!validLocales.includes(locale as Locale)) {
    notFound();
  }
  
  return {
    locale,
    messages: (await import(`../../dictionaries/${locale}.json`)).default
  };
});