// Definindo nosso próprio tipo Theme
type Theme = {
  [key: string]: string;
};

// Cores extraídas do logo da S8 Garante
export const s8Colors = {
  primary: {
    50: '#fff6f2',
    100: '#ffede5',
    200: '#ffd7c5',
    300: '#ffb696',
    400: '#ff8a5e',
    500: '#ff5f2e', // Cor principal do logo (laranja)
    600: '#f94716',
    700: '#d13710',
    800: '#aa2e11',
    900: '#8a2914',
    950: '#4a140a',
  },
  secondary: {
    50: '#f6f6f6',
    100: '#e7e7e7',
    200: '#d1d1d1',
    300: '#b0b0b0',
    400: '#888888',
    500: '#6d6d6d',
    600: '#5d5d5d',
    700: '#4f4f4f',
    800: '#454545', 
    900: '#3d3d3d', // Cor do texto "S8" (preto)
    950: '#000000',
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
    foreground: s8Colors.secondary[950],
    card: '#ffffff',
    'card-foreground': s8Colors.secondary[950],
    popover: '#ffffff',
    'popover-foreground': s8Colors.secondary[950],
    primary: s8Colors.primary[500],
    'primary-foreground': '#ffffff',
    secondary: s8Colors.secondary[900],
    'secondary-foreground': '#ffffff',
    muted: s8Colors.gray[100],
    'muted-foreground': s8Colors.gray[600],
    accent: s8Colors.primary[50],
    'accent-foreground': s8Colors.primary[900],
    destructive: '#ef4444',
    'destructive-foreground': '#ffffff',
    border: s8Colors.gray[200],
    input: s8Colors.gray[200],
    ring: s8Colors.primary[500],
  },
  dark: {
    background: s8Colors.secondary[950],
    foreground: s8Colors.gray[100],
    card: s8Colors.secondary[900],
    'card-foreground': s8Colors.gray[100],
    popover: s8Colors.secondary[900],
    'popover-foreground': s8Colors.gray[100],
    primary: s8Colors.primary[500],
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
    ring: s8Colors.primary[500],
  },
};