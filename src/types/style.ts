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
  success?: string;
  warning?: string;
  error?: string;
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
  letterSpacing?: number;
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

// McKinsey-style defaults
export const MCKINSEY_STYLE: BrandStyle = {
  id: 'mckinsey-default',
  name: 'McKinsey Style',
  colors: {
    primary: '#003366',      // Deep blue
    secondary: '#0066CC',    // Bright blue
    accent: '#00A3E0',       // Light blue
    background: '#FFFFFF',   // White
    text: '#333333',         // Dark gray
    textLight: '#666666',    // Medium gray
  },
  typography: {
    headingFont: 'Georgia',
    bodyFont: 'Arial',
    headingSizes: {
      h1: 44,
      h2: 32,
      h3: 24,
      h4: 20,
    },
    bodySizes: {
      large: 18,
      normal: 14,
      small: 12,
      caption: 10,
    },
    lineHeight: 1.4,
  },
};
