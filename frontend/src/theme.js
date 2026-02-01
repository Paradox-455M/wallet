import { extendTheme } from '@chakra-ui/react';

const focusRing = {
  _focusVisible: {
    boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)',
    outline: 'none',
  },
};

const theme = extendTheme({
  fonts: {
    heading: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  shadows: {
    card: '0 4px 24px rgba(0, 0, 0, 0.12)',
    'card-hover': '0 12px 40px rgba(0, 0, 0, 0.18)',
  },
  styles: {
    global: {
      'html, body': {
        overflowX: 'hidden',
        scrollBehavior: 'smooth',
      },
      body: {
        textAlign: 'left',
      },
      /* Custom scrollbar - WebKit (Chrome, Safari, Edge) */
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        bg: 'gray.800',
        borderRadius: 'full',
      },
      '*::-webkit-scrollbar-thumb': {
        bg: 'gray.600',
        borderRadius: 'full',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        bg: 'gray.500',
      },
      '*::-webkit-scrollbar-corner': {
        bg: 'gray.800',
      },
      /* Firefox - apply to html so scrollable areas inherit */
      html: {
        scrollbarWidth: 'thin',
        scrollbarColor: '#718096 #2D3748',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        ...focusRing,
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'purple.400',
      },
      variants: {
        filled: {
          field: focusRing,
        },
      },
    },
    Link: {
      baseStyle: focusRing,
    },
    Heading: {
      baseStyle: {
        letterSpacing: '-0.02em',
        lineHeight: '1.2',
      },
    },
    Text: {
      baseStyle: {
        lineHeight: '1.6',
      },
    },
  },
});

export default theme;
