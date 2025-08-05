// Definindo nosso próprio tipo Theme em vez de importar
type Theme = {
  [key: string]: string;
};

// Cores extraídas do logo da S8 Garante
export const s8Colors = {
  primary: {
    50: '#eef8fc',
    100: '#d7eef8',
    200: '#afe0f1',
    300: '#78cae6',
    400: '#3aafd7', // Cor principal do logo (azul)
    500: '#1d95be',
    600: '#1478a0',
    700: '#115f7f',
    800: '#134e67',
    900: '#154256',
    950: '#0e2b39',
  },
  secondary: {
    50: '#f9f6f5',
    100: '#f0e8e5',
    200: '#e1d2cc',
    300: '#cdb3a7',
    400: '#b38c7d',
    500: '#a0725f',
    600: '#915c4a',
    700: '#7c4b3c', // Cor secundária do logo (marrom)
    800: '#663e31',
    900: '#56352c',
    950: '#2f1b16',
  },
  gray: {
    50: '#f8f8f8',
    100: '#f0f0f0',
    200: '#e4e4e4',
    300: '#d1d1d1',
    400: '#b4b4b4',
    500: '#9a9a9a',
    600: '#818181',
    700: '#6a6a6a',
    800: '#5a5a5a',
    900: '#4e4e4e',
    950: '#282828',
  },
};

// Configurar as variáveis CSS para o tema da S8 Garante
export const s8Theme = {
  light: {
    background: '#ffffff',
    foreground: s8Colors.gray[950],
    card: '#ffffff',
    'card-foreground': s8Colors.gray[950],
    popover: '#ffffff',
    'popover-foreground': s8Colors.gray[950],
    primary: s8Colors.primary[400],
    'primary-foreground': '#ffffff',
    secondary: s8Colors.secondary[700],
    'secondary-foreground': '#ffffff',
    muted: s8Colors.gray[100],
    'muted-foreground': s8Colors.gray[600],
    accent: s8Colors.primary[50],
    'accent-foreground': s8Colors.primary[900],
    destructive: '#ef4444',
    'destructive-foreground': '#ffffff',
    border: s8Colors.gray[200],
    input: s8Colors.gray[200],
    ring: s8Colors.primary[400],
  },
  dark: {
    background: s8Colors.gray[950],
    foreground: s8Colors.gray[100],
    card: s8Colors.gray[900],
    'card-foreground': s8Colors.gray[100],
    popover: s8Colors.gray[900],
    'popover-foreground': s8Colors.gray[100],
    primary: s8Colors.primary[400],
    'primary-foreground': '#ffffff',
    secondary: s8Colors.secondary[700],
    'secondary-foreground': '#ffffff',
    muted: s8Colors.gray[800],
    'muted-foreground': s8Colors.gray[400],
    accent: s8Colors.primary[900],
    'accent-foreground': s8Colors.primary[100],
    destructive: '#ef4444',
    'destructive-foreground': '#ffffff',
    border: s8Colors.gray[800],
    input: s8Colors.gray[800],
    ring: s8Colors.primary[600],
  },
};