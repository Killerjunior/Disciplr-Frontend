/**
 * Design token type definitions for type-safe token access
 */

export interface ColorToken {
  $type: 'color';
  $value: string;
  $description?: string;
  contrast?: {
    light?: number;
    dark?: number;
  };
  accessibility?: {
    contrastRatios?: Record<string, number>;
    wcagLevel?: 'AA' | 'AAA';
    colorblindSafe?: boolean;
    colorblindSimulation?: {
      protanopia?: string;
      deuteranopia?: string;
      tritanopia?: string;
    };
  };
}

export interface TypographyToken {
  $type: 'typography';
  fontFamily?: { $value: string };
  fontSize?: { $value: string };
  lineHeight?: { $value: string };
  fontWeight?: { $value: number };
  letterSpacing?: { $value: string };
  $description?: string;
}

export interface SpacingToken {
  $type: 'dimension';
  $value: string;
  $description?: string;
}

export interface ShadowLayer {
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
  color: string;
}

export interface ShadowToken {
  $type: 'shadow';
  $value: ShadowLayer | ShadowLayer[];
  $description?: string;
}

export interface MotionToken {
  $type: 'duration' | 'cubicBezier';
  $value: string | number[];
  $description?: string;
}

export interface BorderToken {
  $type: 'dimension' | 'color';
  $value: string;
  $description?: string;
}

export type ColorTokenNode = ColorToken | { [key: string]: ColorTokenNode };

export interface DesignTokens {
  color?: Record<string, ColorTokenNode>;
  typography?: Record<string, TypographyToken>;
  spacing?: Record<string, SpacingToken | Record<string, SpacingToken>>;
  shadow?: Record<string, ShadowToken>;
  motion?: Record<string, MotionToken>;
  border?: Record<string, BorderToken>;
}

