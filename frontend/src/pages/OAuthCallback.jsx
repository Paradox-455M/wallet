import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Spinner, Text, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';

const OAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleOAuthCallback, error, clearError } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const oauthError = params.get('error');

    clearError(); // Clear any previous errors

    if (oauthError) {
      console.error('OAuth Error:', oauthError);
      // Instead of redirecting, trigger a global event to open the login modal overlay
      window.dispatchEvent(new CustomEvent('open-login-modal', { detail: { error: oauthError } }));
      return;
    }

    if (token) {
      handleOAuthCallback(token)
        .then(() => {
           navigate('/dashboard'); // Redirect to dashboard after successful login
        })
        .catch((err) => {
          console.error('Error processing OAuth token:', err);
          // Error is already set in AuthContext by handleOAuthCallback
          window.dispatchEvent(new CustomEvent('open-login-modal', { detail: { error: err?.message || 'OAuth login failed' } }));
          return;
        });
    } else {
      console.error('No token found in OAuth callback');
      // Trigger login modal overlay for missing token
      window.dispatchEvent(new CustomEvent('open-login-modal', { detail: { error: 'OAuth token missing' } }));
      return;
    }
  }, [location, navigate, handleOAuthCallback, clearError]);

  // Display a loading state or message while processing
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minH="100vh" 
      bgGradient="linear(to-br, purple.400, purple.600)"
      p={4}
    >
      <VStack spacing={6} bg="whiteAlpha.200" p={10} borderRadius="xl" boxShadow="2xl" color="white">
        <Heading size="lg">Processing Authentication</Heading>
        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="purple.500" />
        <Text>Please wait while we securely log you in...</Text>
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default OAuthCallback;