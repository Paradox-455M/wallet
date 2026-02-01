import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Text,
  NumberInput,
  NumberInputField,
  Container,
  Flex,
  Spacer,
  HStack,
  Heading,
  Icon,
  Avatar,
  SimpleGrid,
} from '@chakra-ui/react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { LockIcon, EmailIcon, EditIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure, Select, Textarea, InputGroup, InputLeftElement } from '@chakra-ui/react';
import Login from '../pages/Login';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import StarryBackground from './StarryBackground';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CreateTransaction = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth();

  const [role, setRole] = useState('buyer'); // 'buyer' = I'm paying, 'seller' = I'm receiving
  const [formData, setFormData] = useState({
    sellerEmail: '',
    buyerEmail: '',
    amount: '',
    itemDescription: '',
    currency: 'USD'
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (valueString) => {
    setFormData(prev => ({ ...prev, amount: valueString }));
  };

  const validateForm = () => {
    if (role === 'buyer') {
      if (!formData.sellerEmail || !formData.sellerEmail.includes('@')) {
        return 'Please enter a valid seller email address';
      }
    } else {
      if (!formData.buyerEmail || !formData.buyerEmail.includes('@')) {
        return 'Please enter a valid buyer email address';
      }
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return 'Please enter a valid amount greater than 0';
    }
    if (!formData.itemDescription || formData.itemDescription.trim().length < 5) {
      return 'Please provide a detailed item description (at least 5 characters)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to create a transaction');
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      const payload = {
        amount: amount,
        itemDescription: formData.itemDescription.trim()
      };
      if (role === 'buyer') {
        payload.sellerEmail = formData.sellerEmail.trim();
      } else {
        payload.buyerEmail = formData.buyerEmail.trim();
      }
      const { data } = await axios.post('/api/transactions', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast({
        title: 'Transaction Created Successfully! 🎉',
        description: role === 'buyer'
          ? 'Redirecting to payment...'
          : 'Share the transaction link with the buyer so they can pay.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      if (data.transactionId) {
        setTimeout(() => {
          window.location.href = `/transaction/${data.transactionId}`;
        }, 1500);
      }

    } catch (error) {
      let errorMessage = 'Failed to create transaction';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || 
                      error.response.data?.message || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Error in request setup
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: 'Transaction Creation Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden" w="100%">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box position="relative" zIndex={1}>
        <Container maxW="container.md" pt={{base: 20, md: 28}} pb={12} color="white">
          <VStack spacing={6} align="center">
            <Icon as={LockIcon} w={12} h={12} color="purple.300" />
            <Heading as="h1" size="2xl" textAlign="center" fontWeight="bold" color="white">
              Start a New Secure Transaction
            </Heading>
          </VStack>
          
          <Box 
            mt={10}
            bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
            backdropFilter="blur(20px)"
            p={{base: 6, md: 10}} 
            borderRadius="3xl" 
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
            border="1px solid"
            borderColor="whiteAlpha.200"
            color="white"
            _hover={{
              transform: 'translateY(-4px) scale(1.02)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
              borderColor: 'purple.300'
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              h="1px"
              bg="linear-gradient(90deg, transparent 0%, purple.400 50%, transparent 100%)"
            />
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl>
                  <FormLabel fontSize="md" color="purple.200" fontWeight="normal">I am</FormLabel>
                  <SimpleGrid columns={2} spacing={3}>
                    <Button
                      type="button"
                      size="lg"
                      variant={role === 'buyer' ? 'solid' : 'outline'}
                      colorScheme="purple"
                      onClick={() => setRole('buyer')}
                      borderRadius="lg"
                      _focusVisible={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)' }}
                    >
                      Paying (Buyer)
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant={role === 'seller' ? 'solid' : 'outline'}
                      colorScheme="purple"
                      onClick={() => setRole('seller')}
                      borderRadius="lg"
                      _focusVisible={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)' }}
                    >
                      Selling (Seller)
                    </Button>
                  </SimpleGrid>
                  <Text fontSize="xs" color="gray.400" mt={2}>
                    {role === 'buyer' ? "You'll pay; enter the seller's email." : "You'll deliver; enter the buyer's email."}
                  </Text>
                </FormControl>

                {role === 'buyer' ? (
                  <FormControl isRequired>
                    <FormLabel fontSize="md" color="purple.200" fontWeight="normal">Seller's Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={EmailIcon} color="purple.300" />
                      </InputLeftElement>
                      <Input
                        name="sellerEmail"
                        type="email"
                        size="lg"
                        borderRadius="lg"
                        bg="rgba(255, 255, 255, 0.1)"
                        borderColor="whiteAlpha.200"
                        _hover={{ borderColor: 'purple.300'}}
                        focusBorderColor="purple.300"
                        placeholder="seller@example.com"
                        _placeholder={{ color: 'purple.200' }}
                        value={formData.sellerEmail}
                        onChange={handleInputChange}
                        pl={10}
                        color="white"
                      />
                    </InputGroup>
                  </FormControl>
                ) : (
                  <FormControl isRequired>
                    <FormLabel fontSize="md" color="purple.200" fontWeight="normal">Buyer's Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={EmailIcon} color="purple.300" />
                      </InputLeftElement>
                      <Input
                        name="buyerEmail"
                        type="email"
                        size="lg"
                        borderRadius="lg"
                        bg="rgba(255, 255, 255, 0.1)"
                        borderColor="whiteAlpha.200"
                        _hover={{ borderColor: 'purple.300'}}
                        focusBorderColor="purple.300"
                        placeholder="buyer@example.com"
                        _placeholder={{ color: 'purple.200' }}
                        value={formData.buyerEmail}
                        onChange={handleInputChange}
                        pl={10}
                        color="white"
                      />
                    </InputGroup>
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel fontSize="md" color="purple.200" fontWeight="normal">Item/Service Description</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" alignItems="flex-start" pt={3}>
                      <Icon as={EditIcon} color="purple.300" />
                    </InputLeftElement>
                    <Textarea
                      name="itemDescription"
                      size="lg"
                      borderRadius="lg"
                      bg="rgba(255, 255, 255, 0.1)"
                      borderColor="whiteAlpha.200"
                      _hover={{ borderColor: 'purple.300'}}
                      focusBorderColor="purple.300"
                      placeholder="e.g., Website design services, Digital artwork commission, Software license"
                      _placeholder={{ color: 'purple.200' }}
                      value={formData.itemDescription}
                      onChange={handleInputChange}
                      rows={4}
                      pl={10}
                      color="white"
                    />
                  </InputGroup>
                </FormControl>

                <HStack spacing={4} w="full" alignItems="flex-start">
                  <FormControl isRequired flex={1}>
                    <FormLabel fontSize="md" color="purple.200" fontWeight="normal">Amount</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={InfoOutlineIcon} color="purple.300" />
                      </InputLeftElement>
                      <NumberInput
                        min={0.01}
                        precision={2}
                        value={formData.amount}
                        onChange={handleAmountChange}
                        w="full"
                      >
                        <NumberInputField
                          name="amount"
                          size="lg"
                          borderRadius="lg"
                          bg="rgba(255, 255, 255, 0.1)"
                          borderColor="whiteAlpha.200"
                          _hover={{ borderColor: 'purple.300'}}
                          focusBorderColor="purple.300"
                          placeholder="e.g., 500"
                          _placeholder={{ color: 'purple.200' }}
                          pl={10}
                          color="white"
                        />
                      </NumberInput>
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired flex={1}>
                    <FormLabel fontSize="md" color="purple.200" fontWeight="normal">Currency</FormLabel>
                    <Select
                      name="currency"
                      size="lg"
                      borderRadius="lg"
                      bg="rgba(255, 255, 255, 0.1)"
                      borderColor="whiteAlpha.200"
                      _hover={{ borderColor: 'purple.300'}}
                      focusBorderColor="purple.300"
                      value={formData.currency}
                      onChange={handleInputChange}
                      iconColor="purple.300"
                      color="white"
                    >
                      <option style={{ backgroundColor: '#1a202c', color: 'white' }} value="USD">USD - US Dollar</option>
                      <option style={{ backgroundColor: '#1a202c', color: 'white' }} value="EUR">EUR - Euro</option>
                      <option style={{ backgroundColor: '#1a202c', color: 'white' }} value="GBP">GBP - British Pound</option>
                    </Select>
                  </FormControl>
                </HStack>

                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  bg="linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)"
                  color="white"
                  _hover={{
                    bg: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)'
                  }}
                  _active={{ transform: 'translateY(0px)' }}
                  _focusVisible={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)' }}
                  isLoading={loading}
                  isDisabled={loading}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  transition="all 0.3s"
                >
                  {role === 'buyer' ? 'Create & Proceed to Payment' : 'Create Transaction (share link with buyer)'}
                </Button>
                <Text fontSize="xs" color="purple.200" textAlign="center">
                  By clicking "Proceed", you agree to SecureEscrow's <Link as={Link} to="/terms-of-service" color="purple.100" _hover={{textDecoration: 'underline'}}>Terms of Service</Link>.
                </Text>
              </VStack>
            </form>
          </Box>
        </Container>
      </Box>

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
  );
};

export default CreateTransaction;