// Type definitions for the application

// Lead entity type matching the Prisma schema
export interface Lead {
  id: string;
  name: string;
  email: string;
  referer?: string | null;
  collectionPlace: string;
  createdAt: Date;
  updatedAt: Date;
}

// Input type for creating a new lead
export interface CreateLeadInput {
  name: string;
  email: string;
  referer?: string;
  collectionPlace: string;
}

// Collection place enum for type safety
export enum CollectionPlace {
  LANDING_PAGE = 'landing_page',
  LANDING_PAGE_DIALOG = 'landing_page_dialog'
}

// Client error entity type matching the Prisma schema
export interface ClientError {
  id: string;
  error: string;
  errorType: string;
  severity: string;
  url?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  metadata?: any | null;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
}

// Input type for creating a new client error
export interface CreateClientErrorInput {
  error: string;
  errorType?: string;
  severity?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  metadata?: any;
}

// Error type enum for type safety
export enum ErrorType {
  JAVASCRIPT = 'javascript',
  REACT = 'react',
  NETWORK = 'network',
  API = 'api',
  UNHANDLED_PROMISE = 'unhandled_promise'
}

// Error severity enum for type safety
export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}
