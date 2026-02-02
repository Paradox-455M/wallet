import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Box, Button, Heading, Text, VStack, Container } from '@chakra-ui/react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (args: { error: unknown; retry: () => void }) => ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: unknown;
};

/**
 * React Error Boundary: catches JS errors in child tree and shows a fallback UI.
 * Prevents blank screen and allows recovery (e.g. go home).
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback;
      if (fallback && typeof fallback === 'function') {
        return fallback({ error: this.state.error, retry: this.handleRetry });
      }
      return (
        <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center" p={4}>
          <Container maxW="md">
            <VStack spacing={6} textAlign="center">
              <Heading size="lg" color="white">
                Something went wrong
              </Heading>
              <Text color="gray.400" fontSize="sm">
                We're sorry. An unexpected error occurred. You can try again or go back home.
              </Text>
              <VStack spacing={3} w="full">
                <Button colorScheme="purple" onClick={this.handleRetry} w="full">
                  Try again
                </Button>
                <Button as="a" href="/" variant="outline" colorScheme="whiteAlpha" w="full">
                  Go to home
                </Button>
              </VStack>
            </VStack>
          </Container>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
