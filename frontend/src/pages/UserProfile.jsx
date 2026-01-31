import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Avatar,
  HStack,
  Badge,
  Divider,
  Container,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';
import axios from 'axios';


const UserProfile = () => {
  const { currentUser, isAuthenticated, loading: authLoading, fetchCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const toast = useToast();

  const loadProfile = React.useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    setLoading(true);
    setFullName(currentUser.fullName || currentUser.full_name || '');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data.user);
      setFullName(data.user.fullName || data.user.full_name || '');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load profile';
      setLoadError(message);
      toast({
        title: 'Error',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/auth/profile',
        { fullName: fullName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCurrentUser(token);
      setProfile((p) => (p ? { ...p, fullName: fullName.trim() } : p));
      toast({
        title: 'Profile updated',
        description: 'Your name has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.400" />
      </Box>
    );
  }

  const user = profile || currentUser;
  const createdAt = user?.createdAt || user?.created_at;
  const transactionCount = user?.transactionCount ?? profile?.transactionCount ?? 0;
  const originalName = (user?.fullName || user?.full_name || '').trim();
  const canSave = fullName.trim().length > 0 && fullName.trim() !== originalName;

  return (
    <Box minH="100vh" bg="gray.900" position="relative">
      <StarryBackground />
      <Navbar />
      <Box position="relative" zIndex={1}>
        <Container maxW="container.md" py={{ base: 24, md: 28 }} px={4}>
          <VStack spacing={8} align="stretch">
            <Heading color="white" size="2xl" textAlign="center">
              Your Profile
            </Heading>

            <Box
              bg="linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              p={8}
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              color="white"
            >
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner color="purple.400" size="lg" />
                </Box>
              ) : loadError ? (
                <VStack spacing={4} py={6}>
                  <Text color="red.300">{loadError}</Text>
                  <Button colorScheme="purple" variant="outline" onClick={loadProfile}>
                    Retry
                  </Button>
                </VStack>
              ) : (
                <>
                  <HStack spacing={6} mb={8}>
                    <Avatar
                      size="2xl"
                      name={user?.fullName || user?.email}
                      src={user?.avatarUrl}
                      bg="purple.500"
                      border="4px solid"
                      borderColor="purple.400"
                    />
                    <VStack align="start" spacing={1}>
                      <Heading size="lg">{user?.fullName || user?.full_name || 'No name'}</Heading>
                      <Text color="gray.400">{user?.email}</Text>
                      {user?.isAdmin && (
                        <Badge colorScheme="purple" mt={2}>
                          Admin
                        </Badge>
                      )}
                    </VStack>
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
                    <Stat>
                      <StatLabel color="gray.400">Member since</StatLabel>
                      <StatNumber color="white">
                        {createdAt ? new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.400">Total transactions</StatLabel>
                      <StatNumber color="white">{transactionCount}</StatNumber>
                      <StatHelpText color="gray.500">As buyer or seller</StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Divider borderColor="whiteAlpha.200" my={6} />

                  <form onSubmit={handleSave}>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel color="purple.200">Display name</FormLabel>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your name"
                          bg="whiteAlpha.100"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                          maxLength={255}
                        />
                      </FormControl>
                      <HStack spacing={4}>
                        <Button
                          type="submit"
                          colorScheme="purple"
                          isLoading={saving}
                          loadingText="Saving..."
                          isDisabled={saving || !canSave}
                        >
                          Save changes
                        </Button>
                        <Button as={RouterLink} to="/dashboard" variant="outline" colorScheme="whiteAlpha">
                          Back to Dashboard
                        </Button>
                      </HStack>
                    </VStack>
                  </form>
                </>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default UserProfile;
