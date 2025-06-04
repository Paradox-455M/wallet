import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, Container, Flex, Spacer, HStack, Button, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import CreateTransaction from './components/CreateTransaction';
import TransactionDetails from './components/TransactionDetails';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import Testimonials from './pages/Testimonials';
import OAuthCallback from './pages/OAuthCallback'; // Added for OAuth callback
import Dashboard from './pages/Dashboard'; // Added for Dashboard page
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react';
import Navbar from './components/Navbar';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Router>
      <ChakraProvider>
        <AuthProvider>
          <Navbar onLoginOpen={onOpen} />
          <Box>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create-transaction" element={<CreateTransaction />} />
              <Route path="/transaction/:transactionId" element={<TransactionDetailsWrapper />} />
              <Route path="/login" element={<Login />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
            <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" motionPreset="scale">
              <ModalOverlay bg="rgba(0,0,0,0.6)" backdropFilter="blur(6px)" />
              <ModalContent
                bg="rgba(30, 32, 48, 0.95)"
                borderRadius="2xl"
                boxShadow="2xl"
                p={{ base: 0, md: 2 }}
                maxW="420px"
                mx="auto"
                color="white"
                position="relative"
              >
                <Box position="absolute" top={4} right={4} zIndex={2}>
                  <Button onClick={onClose} variant="ghost" colorScheme="whiteAlpha" size="sm" borderRadius="full" _hover={{ bg: 'whiteAlpha.300' }}>
                    &#10005;
                  </Button>
                </Box>
                <ModalBody p={{ base: 4, md: 8 }}>
                  <Login onClose={onClose} modalMode />
                </ModalBody>
              </ModalContent>
            </Modal>
          </Box>
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
};

const TransactionDetailsWrapper = () => {
  const { transactionId } = require('react-router-dom').useParams();
  return <TransactionDetails transactionId={transactionId} />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default App;