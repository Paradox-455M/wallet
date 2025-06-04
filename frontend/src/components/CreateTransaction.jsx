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
} from '@chakra-ui/react'; // Added Avatar
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { LockIcon, EmailIcon, EditIcon, InfoOutlineIcon } from '@chakra-ui/icons'; // Added EmailIcon, EditIcon, InfoOutlineIcon
import { useColorModeValue } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure, Select, Textarea, InputGroup, InputLeftElement } from '@chakra-ui/react'; // Added Select, Textarea, InputGroup, InputLeftElement
import Login from '../pages/Login';
import { useAuth } from '../contexts/AuthContext'; // Added

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

const CreateTransaction = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth(); // Added
  const bgColor = useColorModeValue('purple.500', 'purple.700');
  const textColor = 'white';
  const cardBgColor = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(45, 55, 72, 0.15)'); // Adjusted translucency
  const cardTextColor = useColorModeValue('white', 'gray.200'); // Text color for the form
  const inputBgColor = 'rgba(255, 255, 255, 0.1)'; // Adjusted translucency
  const placeholderColor = 'purple.200';
  const labelColor = 'purple.100'; // Defined label color

  const [formData, setFormData] = useState({
    sellerEmail: '',
    amount: '', // Changed from '0.00' to empty for placeholder visibility
    itemDescription: '',
    currency: 'USD' // Added currency field
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/transactions', {
        ...formData,
        amount: parseFloat(formData.amount)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Show success toast before proceeding to payment
      toast({
        title: 'Transaction Created',
        description: data.message || 'Your transaction has been initiated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });

      const stripe = await stripePromise;
      // Use clientSecret from backend and confirm the payment
      // const result = await stripe.confirmCardPayment(data.clientSecret);
      // if (result.error) {
      //   toast({
      //     title: 'Payment Error',
      //     description: result.error.message || 'Payment could not be completed.',
      //     status: 'error',
      //     duration: 5000,
      //     isClosable: true
      //   });
      // } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      //   toast({
      //     title: 'Payment Successful',
      //     description: 'Your payment was successful!',
      //     status: 'success',
      //     duration: 5000,
      //     isClosable: true
      //   });
      //   // Optionally redirect or update UI here
      // }
      // await stripe.redirectToCheckout({
      //   sessionId: data.stripeSessionId
      // });

      // Only show success toast, payment will be handled elsewhere


    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create transaction',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box position="relative" minH="100vh" overflowX="hidden">
      <Box position="fixed" top={0} left={0} right={0} bottom={0} zIndex={-2} bgGradient="linear(to-br, purple.400, purple.600)">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </Box>

      <Box bgGradient="linear(to-br, purple.400, purple.600)" px={4} position="fixed" w="full" zIndex={1000} boxShadow="sm">
        <Container maxW="container.xl">
          <Flex h={16} alignItems="center">
            <Button   variant="link" onClick={() => window.location.href='/'} fontWeight="bold" color="white" _hover={{textDecoration: 'underline'}} colorScheme="whiteAlpha">
              <HStack spacing={2}>
                <Icon as={LockIcon} w={8} h={8} />
                <Heading size="lg">SecureEscrow</Heading>
              </HStack>
            </Button>
            <Spacer />
            <HStack spacing={4}>
              <Button variant="link" color="white" onClick={() => window.location.href='/how-it-works'} _hover={{textDecoration: 'underline'}}>How it works</Button>
              <Button variant="link" color="white" onClick={() => window.location.href='/features'}_hover={{textDecoration: 'underline'}}>Features</Button>
              <Button variant="link" color="white" onClick={() => window.location.href='/testimonials'} _hover={{textDecoration: 'underline'}}>Testimonials</Button>
              {isAuthenticated && currentUser ? (
                <a href="/dashboard">
                  <Avatar 
                    size="md" 
                    name={currentUser.fullName || currentUser.email} 
                    src={currentUser.photoURL} 
                    border="2px solid #fff"
                    boxShadow="0 0 0 3px #9f7aea"
                    cursor="pointer"
                    _hover={{ boxShadow: '0 0 0 4px #d6bcfa', transform: 'scale(1.08)', transition: 'all 0.2s' }}
                    bgGradient="linear(to-br, purple.400, purple.600)"
                  />
                </a>
              ) : (
                <Button colorScheme="whiteAlpha" variant="ghost" color="white" onClick={onOpen}>Login</Button>
              )}
              <Button as="a" href="/create-transaction" colorScheme="whiteAlpha" bg="white" color="purple.600" _hover={{bg:'gray.100'}}>
                Start Transaction
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.md" pt={{base: 20, md: 28}} pb={12} color={textColor}>
        <VStack spacing={6} align="center">
          <Icon as={LockIcon} w={12} h={12} color="white" /> {/* Added Lock Icon */}
          <Heading as="h1" size="2xl" textAlign="center" fontWeight="bold" color="white">
            Start a New Secure Transaction
          </Heading>
        </VStack>
        <Box 
          mt={10} // Added margin top to separate icon/heading from form box
          bg={cardBgColor} 
          p={{base: 6, md: 10}} 
          borderRadius="2xl" 
          boxShadow="2xl" 
          color={cardTextColor}
          backdropFilter="blur(10px)" // Added backdrop filter for translucency
          border="1px solid" // Added border
          borderColor="rgba(255, 255, 255, 0.2)"
          _hover={{ transform: 'scale(1.05)' }}
          transition="all 0.5s" // Added border color
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontSize="md" color={labelColor} fontWeight="normal">Seller's Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={EmailIcon} color={placeholderColor} />
                  </InputLeftElement>
                  <Input
                    name="sellerEmail"
                    type="email"
                    size="lg"
                    borderRadius="lg"
                    bg={inputBgColor}
                    borderColor="transparent"
                    _hover={{ borderColor: 'purple.300'}}
                    focusBorderColor="purple.300"
                    placeholder="seller@example.com"
                    _placeholder={{ color: placeholderColor }}
                    value={formData.sellerEmail}
                    onChange={handleInputChange}
                    pl={10} // Padding for icon
                    color="white" // Ensure text color is white
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="md" color={labelColor} fontWeight="normal">Item/Service Description</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" alignItems="flex-start" pt={3}>
                    <Icon as={EditIcon} color={placeholderColor} />
                  </InputLeftElement>
                  <Textarea
                    name="itemDescription"
                    size="lg"
                    borderRadius="lg"
                    bg={inputBgColor}
                    borderColor="transparent"
                    _hover={{ borderColor: 'purple.300'}}
                    focusBorderColor="purple.300"
                    placeholder="e.g., Website design services, Digital artwork commission, Software license"
                    _placeholder={{ color: placeholderColor }}
                    value={formData.itemDescription}
                    onChange={handleInputChange}
                    rows={4}
                    pl={10} // Padding to avoid text overlap with icon
                    color="white" // Ensure text color is white
                  />
                </InputGroup>
              </FormControl>

              <HStack spacing={4} w="full" alignItems="flex-start">
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="md" color={labelColor} fontWeight="normal">Amount</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={InfoOutlineIcon} color={placeholderColor} /> {/* Placeholder icon, consider FaCreditCard or similar if available */}
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
                        bg={inputBgColor}
                        borderColor="transparent"
                        _hover={{ borderColor: 'purple.300'}}
                        focusBorderColor="purple.300"
                        placeholder="e.g., 500"
                        _placeholder={{ color: placeholderColor }}
                        pl={10} // Padding for icon
                        color="white" // Ensure text color is white
                      />
                    </NumberInput>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="md" color={labelColor} fontWeight="normal">Currency</FormLabel>
                  <Select
                    name="currency"
                    size="lg"
                    borderRadius="lg"
                    bg={inputBgColor}
                    borderColor="transparent"
                    _hover={{ borderColor: 'purple.300'}}
                    focusBorderColor="purple.300"
                    value={formData.currency}
                    onChange={handleInputChange}
                    iconColor={placeholderColor}
                    color="white" // Ensure text color is white
                  >
                    <option style={{ backgroundColor: '#583791', color: 'white' }} value="USD">USD - US Dollar</option>
                    <option style={{ backgroundColor: '#583791', color: 'white' }} value="EUR">EUR - Euro</option>
                    <option style={{ backgroundColor: '#583791', color: 'white' }} value="GBP">GBP - British Pound</option>
                  </Select>
                </FormControl>
              </HStack>

              <Button
                type="submit"
                size="lg"
                width="full"
                bg="#6D28D9" // Purple color from image
                color="white"
                _hover={{ bg: '#5B21B6' }} // Darker purple on hover
                isLoading={loading}
                isDisabled={loading}
                py={6} // Increased padding for button height
                fontSize="lg"
                fontWeight="bold"
                borderRadius="lg"
              >
                Proceed to Secure Payment
              </Button>
              <Text fontSize="xs" color="purple.200" textAlign="center">
                By clicking "Proceed", you agree to SecureEscrow's <Link as={Link} to="/terms-of-service" color="purple.100" _hover={{textDecoration: 'underline'}}>Terms of Service</Link>.
              </Text>
            </VStack>
          </form>
        </Box>
      </Container>
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