import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, VStack, Heading, Text, Alert, AlertIcon, Spinner, useColorModeValue, Container, Flex, Icon, Spacer, HStack, Link as ChakraLink, Divider, useDisclosure } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { LockIcon } from '@chakra-ui/icons';

const Stars = (props) => {
  const ref = React.useRef();
  const [sphere] = React.useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#ffa0e0" size={0.005} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
};

import Navbar from '../components/Navbar';

const Login = ({ onClose, modalMode }) => {
  const { onOpen } = useDisclosure();
  const { login, register, handleOAuthLogin, isAuthenticated, loading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [pageError, setPageError] = useState('');
  const [emailError, setEmailError] = useState('');

  const bgColor = modalMode ? 'rgba(30,32,48,0.95)' : useColorModeValue('white', 'gray.800');
  const textColor = modalMode ? 'white' : useColorModeValue('gray.800', 'white'); // Adjusted for non-modal
  const headingColor = 'white'; // For modal consistency
  const inputBg = modalMode ? 'rgba(255,255,255,0.08)' : useColorModeValue('gray.50', 'gray.700');
  const inputText = modalMode ? 'white' : useColorModeValue('gray.800', 'white');
  const borderColor = modalMode ? 'rgba(255,255,255,0.18)' : useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    clearError(); // Clear context errors on component mount/switch mode
    const queryParams = new URLSearchParams(location.search);
    const oauthError = queryParams.get('error');
    if (oauthError) {
      setPageError(`OAuth login failed: ${oauthError.replace(/_/g, ' ')}`);
      // Clear the error from URL so it doesn't persist on refresh
      navigate(location.pathname, { replace: true }); 
    }
  }, [location, clearError, navigate, isRegisterMode]);

  useEffect(() => {
    if (authError) {
      setPageError(authError);
    }
  }, [authError]);

  useEffect(() => {
    const handleOpenLoginModal = (e) => {
      setPageError(e.detail.error);
      onOpen();
    };

    window.addEventListener('open-login-modal', handleOpenLoginModal);
    return () => window.removeEventListener('open-login-modal', handleOpenLoginModal);
  }, [onOpen]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(e.target.value)) {
        setEmailError('Invalid email format');
      } else {
        setEmailError('');
      }
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setForm({ email: '', password: '', fullName: '' });
    setPageError('');
    setEmailError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageError('');
    clearError();
    try {
      if (isRegisterMode) {
        await register(form.email, form.password, form.fullName);
      } else {
        await login(form.email, form.password);
      }
      if (onClose) onClose(); // Close modal on success
      else navigate('/dashboard'); // Redirect to dashboard on page success
    } catch (err) {
      // Error is already set by AuthContext, or we can set pageError for local form errors
      // setPageError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  if (loading && !pageError) { // Show spinner only if not displaying an error already
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH={modalMode ? "auto" : "100vh"} p={modalMode ? 4 : 10}>
        <Spinner size="xl" color={modalMode ? "white" : "purple.500"} />
      </Box>
    );
  }

  if (isAuthenticated && !modalMode) {
    navigate('/');
    return null;
  }
  if (isAuthenticated && modalMode && onClose) {
    onClose();
    navigate('/dashboard');
    return null;
  }

  return (
    <Box position={modalMode ? "relative" : "static"} minH={modalMode ? undefined : "100vh"} overflow={modalMode ? undefined : "hidden"}>
      {!modalMode && (
        <Navbar onLoginOpen={() => {}} />
      )}
      {!modalMode && (
        <Box p={8} pt={24}>
          <Box 
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={-1}
            bgGradient="linear(to-br, purple.400, purple.600)"
          >
            <Canvas camera={{ position: [0, 0, 1] }}>
              <Stars />
            </Canvas>
          </Box>
        </Box>
      )}
      <Box maxW={modalMode ? "100%" : "md"} mx="auto" mt={modalMode ? 0 : {base: 20, md: 32}} p={modalMode ? 0 : 8} borderWidth={modalMode ? 0 : 1} borderRadius={modalMode ? "2xl" : "lg"} bg={bgColor} color={headingColor} boxShadow={modalMode ? "none" : "2xl"}>
        <VStack spacing={6} align="stretch" p={modalMode ? 2 : 0}>
          <Heading fontSize="2xl" mb={modalMode ? 2 : 4} textAlign="center" fontWeight="bold">
            {isRegisterMode ? 'Create Account' : 'Login'}
          </Heading>
          {(pageError || authError) && (
            <Alert status="error" mb={4} borderRadius="md" variant="subtle">
              <AlertIcon />
              {pageError || authError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} style={{width:'100%'}}>
            <VStack spacing={4} align="stretch">
              {isRegisterMode && (
                <FormControl isRequired>
                  <FormLabel color={textColor}>Full Name</FormLabel>
                  <Input
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    bg={inputBg}
                    color={inputText}
                    borderColor={borderColor}
                    _placeholder={{ color: modalMode ? 'gray.300' : 'gray.500' }}
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #9F7AEA' }}
                  />
                </FormControl>
              )}

              <FormControl isRequired isInvalid={!!emailError}>
                <FormLabel color={textColor}>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                  _placeholder={{ color: modalMode ? 'gray.300' : 'gray.500' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #9F7AEA' }}
                />
                <FormErrorMessage>{emailError}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={textColor}>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  bg={inputBg}
                  color={inputText}
                  borderColor={borderColor}
                  _placeholder={{ color: modalMode ? 'gray.300' : 'gray.500' }}
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px #9F7AEA' }}
                />
              </FormControl>
              <Button
                type="submit"
                width="full"
                mt={2}
                bgGradient="linear(to-r, #6B46C1, #805AD5)"
                color="white"
                _hover={{ bgGradient: "linear(to-r, #805AD5, #6B46C1)" }}
                fontWeight="bold"
                fontSize="lg"
                borderRadius="lg"
                py={6}
                isLoading={loading}
              >
                {isRegisterMode ? 'Register' : 'Login'}
              </Button>
              
              <HStack my={4}>
                <Divider borderColor={modalMode ? "whiteAlpha.400" : "gray.300"} />
                <Text fontSize="sm" whiteSpace="nowrap" color={modalMode ? 'gray.300' : 'gray.500'}>OR CONTINUE WITH</Text>
                <Divider borderColor={modalMode ? "whiteAlpha.400" : "gray.300"} />
              </HStack>

              <HStack spacing={4}>
                <Button
                  flex={1}
                  bg="red.500"
                  color="white"
                  leftIcon={<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M21.805 10.023h-9.765v3.954h5.617c-.241 1.23-1.482 3.617-5.617 3.617-3.377 0-6.13-2.797-6.13-6.25s2.753-6.25 6.13-6.25c1.922 0 3.217.82 3.96 1.527l2.703-2.637c-1.71-1.582-3.92-2.563-6.663-2.563-5.523 0-10 4.477-10 10s4.477 10 10 10c5.77 0 9.59-4.047 9.59-9.75 0-.656-.07-1.156-.156-1.617z"/></svg>}
                  _hover={{ bg: 'red.600' }}
                  fontWeight="bold"
                  fontSize="md"
                  borderRadius="lg"
                  py={5}
                  onClick={() => handleOAuthLogin('google')}
                  isLoading={loading}
                >
                  Google
                </Button>
                <Button
                  flex={1}
                  bg="#24292F"
                  color="white"
                  leftIcon={<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.921.43.371.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576 4.765-1.588 8.199-6.084 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>}
                  _hover={{ bg: '#1b1f23' }}
                  fontWeight="bold"
                  fontSize="md"
                  borderRadius="lg"
                  py={5}
                  onClick={() => handleOAuthLogin('github')}
                  isLoading={loading}
                >
                  GitHub
                </Button>
              </HStack>
              <Text textAlign="center" mt={4} color={modalMode ? 'gray.300' : 'gray.600'}>
                {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <ChakraLink color="purple.300" fontWeight="bold" onClick={toggleMode} cursor="pointer">
                  {isRegisterMode ? 'Login here' : 'Register here'}
                </ChakraLink>
              </Text>
              {!isRegisterMode && (
                <Button
                  variant="link"
                  colorScheme="blue"
                  width="full"
                  mt={0}
                  fontWeight="medium"
                  onClick={() => navigate('/forgot-password')} // Assuming you have a forgot password page route
                  color={modalMode ? 'blue.300' : 'blue.500'}
                >
                  Forgot Password?
                </Button>
              )}
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};

export default Login;