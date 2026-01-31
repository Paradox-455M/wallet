import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { ChakraProvider, Box, Button, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import theme from './theme';
import CreateTransaction from './components/CreateTransaction';
import TransactionDetails from './components/TransactionDetails';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import Testimonials from './pages/Testimonials';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react';
import Navbar from './components/Navbar';

const AppContent = ({ onOpen, onClose, isOpen }) => {
  const { isAuthenticated, loading } = useAuth();

  // Auto-open login modal when user is not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Check if we're on a protected route
      const protectedRoutes = ['/dashboard', '/create-transaction', '/profile', '/admin'];
      const currentPath = window.location.pathname;
      if (protectedRoutes.includes(currentPath)) {
        onOpen();
      }
    }
  }, [isAuthenticated, loading, onOpen]);

  return (
    <>
      <Navbar onLoginOpen={onOpen} />
      <Box>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create-transaction" element={<CreateTransaction />} />
          <Route path="/transaction/:transactionId" element={<TransactionDetailsWrapper />} />
          {/* Login is handled via modal only */}
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/features" element={<Features />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
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
    </>
  );
};

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Router>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <AppContent onOpen={onOpen} onClose={onClose} isOpen={isOpen} />
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
};

const TransactionDetailsWrapper = () => {
  const { transactionId } = useParams();
  return <TransactionDetails transactionId={transactionId} />;
};

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.400" thickness="4px" />
      </Box>
    );
  }
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin === true;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default App;