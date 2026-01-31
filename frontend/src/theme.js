import { extendTheme } from '@chakra-ui/react';

const focusRing = {
  _focusVisible: {
    boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)',
    outline: 'none',
  },
};

const theme = extendTheme({
  fonts: {
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
  },
  shadows: {
    card: '0 4px 24px rgba(0, 0, 0, 0.12)',
    'card-hover': '0 12px 40px rgba(0, 0, 0, 0.18)',
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
  },
});

export default theme;
