export const APP_NAME = 'S8 Garante';

export const PLANOS = ['Bronze', 'Prata', 'Ouro'] as const;
export type Plano = typeof PLANOS[number];

export const STATUS_ANALISE = ['Aguardando', 'Aprovado', 'Rejeitado'] as const;
export type StatusAnalise = typeof STATUS_ANALISE[number];

export const TIPOS_USUARIO = ['admin', 'imobiliaria'] as const;
export type TipoUsuario = typeof TIPOS_USUARIO[number];

export const TIPOS_DOCUMENTO = [
  'RG',
  'CPF',
  'Comprovante de Renda',
  'Comprovante de Residência',
  'Contrato de Locação',
  'Contrato de Fiança',
  'Termo Assinado',
  'Aditivo',
  'Outro'
] as const;
export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];

export const ADMIN_EMAIL = 'adm@s8garante.com.br';