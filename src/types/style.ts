export interface BrandStyle {
  id: string;
  name: string;
  colors: BrandColors;
  typography: BrandTypography;
  logo?: BrandLogo;
  guidelines?: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
}

export interface BrandTypography {
  headingFont: string;
  bodyFont: string;
  headingSizes: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
  };
  bodySizes: {
    large: number;
    normal: number;
    small: number;
    caption: number;
  };
  lineHeight: number;
}

export interface BrandLogo {
  url?: string;
  base64?: string;
  width?: number;
  height?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ExtractedStyle {
  colors: Partial<BrandColors>;
  fonts: string[];
  suggestedTypography?: Partial<BrandTypography>;
  rawGuidelines?: string;
}

// Dark Corporate Theme (used for generated presentations)
export const DARK_CORPORATE_STYLE: BrandStyle = {
  id: 'dark-corporate',
  name: 'Dark Corporate',
  colors: {
    primary: '#0a1628',
    secondary: '#1a2744',
    accent: '#f5b800',
    background: '#0a1628',
    text: '#ffffff',
    textLight: '#94a3b8',
  },
  typography: {
    headingFont: 'Arial',
    bodyFont: 'Arial',
    headingSizes: {
      h1: 48,
      h2: 36,
      h3: 28,
      h4: 22,
    },
    bodySizes: {
      large: 18,
      normal: 14,
      small: 12,
      caption: 10,
    },
    lineHeight: 1.5,
  },
};
