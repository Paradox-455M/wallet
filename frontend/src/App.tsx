import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import theme from './theme';
import LandingPage from './components/LandingPage';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

const CreateTransaction = lazy(() => import('./components/CreateTransaction'));
const TransactionDetails = lazy(() => import('./components/TransactionDetails'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Features = lazy(() => import('./pages/Features'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Admin = lazy(() => import('./pages/Admin'));

type AppContentProps = {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
};

const RouteFallback = () => (
  <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
    <Spinner size="xl" color="purple.400" thickness="4px" />
  </Box>
);

const AppContent = ({ onOpen, onClose, isOpen }: AppContentProps) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
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
          <Route
            path="/create-transaction"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CreateTransaction />
              </Suspense>
            }
          />
          <Route path="/transaction/:transactionId" element={<TransactionDetailsWrapper />} />
          <Route
            path="/how-it-works"
            element={
              <Suspense fallback={<RouteFallback />}>
                <HowItWorks />
              </Suspense>
            }
          />
          <Route
            path="/features"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Features />
              </Suspense>
            }
          />
          <Route
            path="/testimonials"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Testimonials />
              </Suspense>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <Suspense fallback={<RouteFallback />}>
                <OAuthCallback />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <UserProfile />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Suspense fallback={<RouteFallback />}>
                    <Admin />
                  </Suspense>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
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
              <Button
                onClick={onClose}
                variant="ghost"
                colorScheme="whiteAlpha"
                size="sm"
                borderRadius="full"
                _hover={{ bg: 'whiteAlpha.300' }}
              >
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
  const { transactionId } = useParams<{ transactionId: string }>();
  if (!transactionId) {
    return <Navigate to="/" replace />;
  }
  return (
    <Suspense fallback={<RouteFallback />}>
      <TransactionDetails transactionId={transactionId} />
    </Suspense>
  );
};

type RouteGuardProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: RouteGuardProps) => {
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

const AdminRoute = ({ children }: RouteGuardProps) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.isAdmin === true;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
};

export default App;
