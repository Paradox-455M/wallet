import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Spinner, Text, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import StarryBackground from '../components/StarryBackground';

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
    <Box minH="100vh" bg="gray.900" position="relative">
      <StarryBackground />
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="100vh" 
        position="relative"
        zIndex={1}
      >
        <Box
          bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
          backdropFilter="blur(20px)"
          p={12}
          borderRadius="3xl"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          textAlign="center"
          position="relative"
          overflow="hidden"
          maxW="500px"
          mx="auto"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            h="1px"
            bg="linear-gradient(90deg, transparent 0%, purple.400 50%, transparent 100%)"
          />
          <VStack spacing={8} color="white">
            <Heading 
              size="lg" 
              bgGradient="linear(to-r, purple.300, blue.300)"
              bgClip="text"
              fontWeight="bold"
              style={{marginTop: '5%'}}
            >
              Processing Authentication
            </Heading>
            <Spinner 
              size="xl" 
              thickness="4px" 
              speed="0.65s" 
              emptyColor="gray.600" 
              color="purple.300"
            />
            <Text color="gray.300" fontSize="md">
              Please wait while we securely log you in...
            </Text>
            {error && (
              <Alert 
                status="error" 
                borderRadius="xl"
                bg="rgba(254, 202, 202, 0.1)"
                border="1px solid"
                borderColor="red.300"
                color="red.200"
              >
                <AlertIcon />
                {error}
              </Alert>
            )}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default OAuthCallback;