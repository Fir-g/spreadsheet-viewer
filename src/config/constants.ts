// Application constants
export const APP_CONFIG = {
  NAME: 'Qubera AI',
  DESCRIPTION: 'AI-powered data processing platform',
  VERSION: '1.0.0',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const FILE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['.pdf', '.xlsx'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  PDF_DOCUMENT_TYPES: ['DDQ', 'LPA', 'PPM'],
  XLSX_DOCUMENT_TYPES: ['Summary', 'Cashflows'],
} as const;

export const CACHE_CONFIG = {
  DURATION: 5 * 60 * 1000, // 5 minutes
  KEYS: {
    PROJECTS: 'projects',
    FILES: 'files',
    CHAT_SESSIONS: 'chat-sessions',
    EXTRACTED_DATA: 'extracted-data',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace',
  NOT_FOUND: '/404',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  THEME: 'theme',
  USER_PREFERENCES: 'user-preferences',
} as const;