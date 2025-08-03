export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface StyleProps {
  isDark: boolean;
}

export interface ThemeStyles {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  border: string;
  shadow: string;
}
