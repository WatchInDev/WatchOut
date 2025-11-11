const globalFontSize = 14;

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'subtitle1'
  | 'subtitle2'
  | 'caption';

export type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'primaryInverse';

export const theme = {
  typography: {
    fontFamily: 'Poppins_400Regular',
    h1: {
      fontSize: globalFontSize * 2.5,
      fontWeight: 700,
      lineHeight: 48,
    },
    h2: {
      fontSize: globalFontSize * 2,
      fontWeight: 700,
      lineHeight: 36,
    },
    h3: {
      fontSize: globalFontSize * 1.75,
      fontWeight: 600,
      lineHeight: 32,
    },
    h4: {
      fontSize: globalFontSize * 1.5,
      fontWeight: 500,
      lineHeight: 28,
    },
    h5: {
      fontSize: globalFontSize * 1.25,
      fontWeight: 500,
      lineHeight: 20,
    },
    h6: {
      fontSize: globalFontSize * 1.125,
      fontWeight: 500,
      lineHeight: 18,
    },
    body1: {
      fontSize: globalFontSize * 1,
      lineHeight: 20,
    },
    body2: {
      fontSize: globalFontSize * 0.875,
      lineHeight: 18,
    },
    subtitle1: {
      fontSize: globalFontSize * 1.125,
      fontWeight: 600,
      lineHeight: 20,
    },
    subtitle2: {
      fontSize: globalFontSize,
      fontWeight: 600,
      lineHeight: 20,
    },
    caption: {
      fontSize: globalFontSize * 0.75,
      fontWeight: 400,
      lineHeight: 16,
    },
  },
  palette: {
    primary: '#00639A',
    secondary: '#006783',
    tertiary: '#909090',
    error: '#BA1A1A',
    text: {
      primary: '#202020',
      secondary: '#444444',
      tertiary: '#909090',
      primaryInverse: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#E9F0F4',
    },
  },
};
