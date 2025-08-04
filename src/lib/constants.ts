export const BRAND_COLORS = {
  primary: '#1E40AF', // Azul da logo S8 Garante
  secondary: '#3B82F6',
  accent: '#60A5FA',
  dark: '#1E3A8A',
  light: '#EFF6FF',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  IMOBILIARIA: 'imobiliaria',
} as const;

export const ANALYSIS_STATUS = {
  AGUARDANDO: 'aguardando',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
} as const;

export const PLANOS = {
  BRONZE: 'bronze',
  PRATA: 'prata',
  OURO: 'ouro',
} as const;

export const DEFAULT_ADMIN = {
  email: 'adm@s8garante.com.br',
  password: 'S8garante2025@',
};