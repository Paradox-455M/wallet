import { Suspense, lazy, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Link,
  HStack,
  Icon,
  Progress,
  Container,
  SimpleGrid,
  Grid,
  GridItem,
  VStack,
} from '@chakra-ui/react';
import { LockIcon, StarIcon } from '@chakra-ui/icons';
import {
  FaUserCircle,
  FaShieldAlt,
  FaHandshake,
  FaFileContract,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaBolt,
  FaGlobe,
  FaHeadset,
  FaUniversity,
  FaRegLightbulb,
} from 'react-icons/fa';
import { IoShieldCheckmark, IoBarChart, IoPeople } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
const StarryBackground = lazy(() => import('./StarryBackground'));

const LandingPage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);

  if (isAuthenticated && currentUser) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden" w="100%">
      <Suspense fallback={null}>
        <StarryBackground />
      </Suspense>
      <Navbar />
      <Box position="relative" zIndex={1}>
        <Container maxW="container.xl" pt={{ base: 16, md: 24 }} pb={{ base: 12, md: 20 }} color="white">
          <Flex direction={{ base: 'column', lg: 'row' }} align="center" justify="space-between">
            <VStack
              spacing={6}
              align={{ base: 'center', lg: 'flex-start' }}
              textAlign={{ base: 'center', lg: 'left' }}
              maxW={{ base: '100%', lg: '54%' }}
              mb={{ base: 10, lg: 0 }}
            >
              <Text as="span" fontSize="sm" fontWeight="600" color="purple.300" textTransform="uppercase" letterSpacing="wider">
                Secure Escrow for Digital Goods
              </Text>
              <Heading as="h1" size={{ base: '2xl', md: '3xl', lg: '4xl' }} fontWeight="700" lineHeight="1.2" letterSpacing="-0.02em">
                Secure digital transactions made simple
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.300" lineHeight="1.6" maxW="32rem">
                Buy and sell with confidence. Your funds and files are protected until both sides deliver.
              </Text>
              <HStack spacing={4} mt={2} flexWrap="wrap" justify={{ base: 'center', lg: 'flex-start' }}>
                <Button
                  as={Link}
                  href="/create-transaction"
                  bg="white"
                  color="purple.600"
                  size="lg"
                  px={8}
                  py={6}
                  borderRadius="xl"
                  fontWeight="600"
                  _hover={{ bg: 'gray.50', transform: 'translateY(-1px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  Start Transaction
                </Button>
                <Button
                  as={Link}
                  variant="outline"
                  borderWidth="2px"
                  borderColor="whiteAlpha.400"
                  color="white"
                  size="lg"
                  href="/how-it-works"
                  px={8}
                  py={6}
                  borderRadius="xl"
                  fontWeight="600"
                  _hover={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.600' }}
                  _active={{ transform: 'translateY(0)' }}
                  transition="all 0.2s"
                >
                  How it works
                </Button>
              </HStack>
            </VStack>

            <Box
              bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
              backdropFilter="blur(20px)"
              p={8}
              borderRadius="3xl"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              color="white"
              w={{ base: '90%', sm: '80%', md: '450px' }}
              mt={{ base: 10, lg: 0 }}
              _hover={{
                transform: 'translateY(-4px) scale(1.02)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                borderColor: 'purple.300',
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
              <HStack mb={6}>
                <Icon as={LockIcon} w={6} h={6} color="purple.300" />
                <Heading size="md" color="white">
                  Secure Transaction
                </Heading>
              </HStack>

              <VStack spacing={4} align="stretch">
                <HStack>
                  <Icon as={FaUserCircle} w={6} h={6} color="blue.300" />
                  <Box>
                    <Text fontSize="sm" color="gray.400">
                      Buyer
                    </Text>
                    <Text fontWeight="bold" color="white">
                      John D.
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Icon as={FaUserCircle} w={6} h={6} color="green.300" />
                  <Box>
                    <Text fontSize="sm" color="gray.400">
                      Seller
                    </Text>
                    <Text fontWeight="bold" color="white">
                      Creative Designs Co.
                    </Text>
                  </Box>
                </HStack>

                <Box mt={4} pt={4} borderTopWidth="1px" borderColor="whiteAlpha.200">
                  <Text fontSize="sm" color="gray.400">
                    Transaction amount
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="white">
                    $1,250.00
                  </Text>
                </Box>

                <Box mt={4}>
                  <Progress value={75} colorScheme="purple" size="sm" borderRadius="md" />
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    75% complete - awaiting file upload
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Flex>
        </Container>

        <Box py={{ base: 12, md: 16 }}>
          <Container maxW="container.lg">
            <VStack spacing={4} mb={{ base: 8, md: 12 }}>
              <Text fontWeight="medium" color="gray.400" textAlign="center">
                Trusted by businesses and individuals worldwide
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 8, md: 10 }} textAlign="center">
              <Box
                bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                backdropFilter="blur(20px)"
                p={6}
                borderRadius="3xl"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  borderColor: 'purple.300',
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
                <HStack justify="center" spacing={3}>
                  <Icon as={IoShieldCheckmark} w={8} h={8} color="purple.300" />
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    256-bit Encryption
                  </Text>
                </HStack>
              </Box>
              <Box
                bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                backdropFilter="blur(20px)"
                p={6}
                borderRadius="3xl"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  borderColor: 'purple.300',
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
                <HStack justify="center" spacing={3}>
                  <Icon as={IoBarChart} w={8} h={8} color="purple.300" />
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    10,000+ Transactions
                  </Text>
                </HStack>
              </Box>
              <Box
                bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                backdropFilter="blur(20px)"
                p={6}
                borderRadius="3xl"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  borderColor: 'purple.300',
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
                <HStack justify="center" spacing={3}>
                  <Icon as={IoPeople} w={8} h={8} color="purple.300" />
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    Global Support
                  </Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={{ base: 16, md: 20 }}>
          <Container maxW="container.xl">
            <VStack spacing={4} mb={{ base: 10, md: 16 }} textAlign="center">
              <Heading color="white">How SecureEscrow works</Heading>
              <Text fontSize="lg" color="gray.300">
                A simple 3-step process protects both buyers and sellers
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }}>
              {[
                {
                  icon: FaHandshake,
                  title: 'Buyer sends money',
                  text: 'The buyer initiates the transaction by securely depositing funds into our escrow system. The money is held safely until the transaction is complete.',
                  step: 1,
                },
                {
                  icon: FaFileContract,
                  title: 'Seller uploads file',
                  text: 'The seller securely uploads the digital goods to our platform. The files are encrypted and stored safely until the transaction is finalized.',
                  step: 2,
                },
                {
                  icon: FaShieldAlt,
                  title: 'Both get what they came for',
                  text: 'Once both conditions are met, the buyer receives the files and the seller receives the payment. It\'s a win-win for everyone involved.',
                  step: 3,
                },
              ].map((item) => (
                <Box
                  key={item.step}
                  textAlign="center"
                  p={8}
                  bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                  backdropFilter="blur(20px)"
                  borderRadius="3xl"
                  boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  pos="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    borderColor: 'purple.300',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    h="1px"
                    bg="linear-gradient(90deg, transparent 0%, purple.400 50%, transparent 100%)"
                  />
                  <Box
                    bg="linear-gradient(135deg, purple.500 0%, blue.500 100%)"
                    color="white"
                    borderRadius="full"
                    w={10}
                    h={10}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xl"
                    fontWeight="bold"
                    mx="auto"
                    mb={6}
                    boxShadow="0 4px 20px rgba(147, 51, 234, 0.4)"
                  >
                    {item.step}
                  </Box>
                  <Icon as={item.icon} w={16} h={16} mb={6} color="purple.300" />
                  <Heading size="md" mb={4} color="white">
                    {item.title}
                  </Heading>
                  <Text color="gray.300">{item.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={{ base: 16, md: 20 }}>
          <Container maxW="container.xl">
            <VStack spacing={4} mb={{ base: 10, md: 16 }} textAlign="center">
              <Heading color="white">Why choose SecureEscrow?</Heading>
              <Text fontSize="lg" color="gray.300">
                Built for security, designed for simplicity
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }}>
              {[
                { icon: FaShieldAlt, title: 'No scams', text: 'Eliminate the risk of fraud. Funds are only released when both parties fulfill their obligations.' },
                { icon: FaBolt, title: 'Fast payouts', text: 'Sellers receive their money quickly through multiple payout options.' },
                { icon: FaRegLightbulb, title: 'Simple process', text: 'Our intuitive interface makes managing escrow transactions effortless.' },
                { icon: FaHeadset, title: '24/7 Support', text: 'Our dedicated support team is available around the clock to assist you.' },
                { icon: FaGlobe, title: 'Global reach', text: 'Conduct secure transactions with anyone, anywhere in the world.' },
                { icon: FaUniversity, title: 'Military-grade security', text: 'Your data and transactions are protected with bank-level encryption.' },
              ].map((feature) => (
                <Box
                  key={feature.title}
                  p={8}
                  bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                  backdropFilter="blur(20px)"
                  borderRadius="3xl"
                  boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    borderColor: 'purple.300',
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
                  <Icon as={feature.icon} w={12} h={12} mb={5} color="purple.300" />
                  <Heading size="md" mb={3} color="white">
                    {feature.title}
                  </Heading>
                  <Text color="gray.300">{feature.text}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={{ base: 16, md: 20 }}>
          <Container maxW="container.xl">
            <VStack spacing={4} mb={{ base: 10, md: 16 }} textAlign="center">
              <Heading color="white">What our users say</Heading>
              <Text fontSize="lg" color="gray.300">
                Trusted by businesses and individuals worldwide
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 8, md: 10 }}>
              {[
                { name: 'Sarah Johnson', role: 'Freelance Designer', text: "SecureEscrow has given me peace of mind... I know I'll get paid.", avatar: FaUserCircle },
                { name: 'Michael Chen', role: 'Small Business Owner', text: 'Incredibly easy to use, eliminated payment disputes. Highly recommended!', avatar: FaUserCircle },
                { name: 'David Rodriguez', role: 'Online Course Creator', text: 'Transformed how I sell courses. Builds trust, and I get paid instantly.', avatar: FaUserCircle },
              ].map((testimonial) => (
                <Box
                  key={testimonial.name}
                  p={8}
                  bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                  backdropFilter="blur(20px)"
                  borderRadius="3xl"
                  boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  textAlign="center"
                  _hover={{
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    borderColor: 'purple.300',
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
                  <Icon as={testimonial.avatar} w={16} h={16} mb={4} color="purple.300" mx="auto" />
                  <Heading size="md" mb={1} color="white">
                    {testimonial.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.400" mb={4}>
                    {testimonial.role}
                  </Text>
                  <Text fontStyle="italic" color="gray.300" mb={4}>
                    &quot;{testimonial.text}&quot;
                  </Text>
                  <HStack justify="center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} as={StarIcon} color="yellow.400" />
                    ))}
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box py={{ base: 16, md: 24 }} color="white">
          <Container maxW="container.md" textAlign="center">
            <Heading size={{ base: 'xl', md: '2xl' }} mb={4}>
              Ready to transact with confidence?
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} mb={8} color="gray.300">
              Join thousands of satisfied users who trust SecureEscrow.
            </Text>
            <HStack spacing={4} justify="center">
              <Button
                as={Link}
                href="/create-transaction"
                bg="linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)"
                color="white"
                size="lg"
                px={10}
                _hover={{
                  bg: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                }}
                _active={{ transform: 'translateY(0px)' }}
                fontWeight="bold"
                borderRadius="xl"
                transition="all 0.3s"
              >
                Start Transaction
              </Button>
              <Button variant="outline" borderColor="white" color="white" size="lg" px={10} _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                Contact Sales
              </Button>
            </HStack>
          </Container>
        </Box>

        <Box bg="gray.800" color="gray.400" py={{ base: 10, md: 16 }}>
          <Container maxW="container.xl">
            <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }} gap={{ base: 8, md: 6 }}>
              <GridItem>
                <HStack spacing={2} mb={4}>
                  <Icon as={LockIcon} w={7} h={7} color="purple.300" />
                  <Heading size="md" color="white">
                    SecureEscrow
                  </Heading>
                </HStack>
                <Text fontSize="sm" mb={4}>
                  Secure digital transactions worldwide.
                </Text>
                <HStack spacing={4}>
                  <Link href="#">
                    <Icon as={FaTwitter} w={5} h={5} _hover={{ color: 'white' }} />
                  </Link>
                  <Link href="#">
                    <Icon as={FaFacebook} w={5} h={5} _hover={{ color: 'white' }} />
                  </Link>
                  <Link href="#">
                    <Icon as={FaLinkedin} w={5} h={5} _hover={{ color: 'white' }} />
                  </Link>
                  <Link href="#">
                    <Icon as={FaInstagram} w={5} h={5} _hover={{ color: 'white' }} />
                  </Link>
                </HStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" color="white" mb={4}>
                  PRODUCT
                </Heading>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Link href="#" _hover={{ color: 'white' }}>
                    Features
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Pricing
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    API
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Integrations
                  </Link>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" color="white" mb={4}>
                  COMPANY
                </Heading>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Link href="#" _hover={{ color: 'white' }}>
                    About
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Blog
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Careers
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Press
                  </Link>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" color="white" mb={4}>
                  LEGAL
                </Heading>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Link href="#" _hover={{ color: 'white' }}>
                    Privacy
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Terms
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Cookie Policy
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    GDPR
                  </Link>
                </VStack>
              </GridItem>

              <GridItem>
                <Heading size="sm" color="white" mb={4}>
                  SUPPORT
                </Heading>
                <VStack align="start" spacing={2} fontSize="sm">
                  <Link href="#" _hover={{ color: 'white' }}>
                    Help Center
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Contact Us
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Status
                  </Link>
                  <Link href="#" _hover={{ color: 'white' }}>
                    Security
                  </Link>
                </VStack>
              </GridItem>
            </Grid>
            <Text textAlign="center" mt={10} fontSize="sm" borderTopWidth="1px" borderColor="gray.700" pt={6}>
              &copy; {new Date().getFullYear()} SecureEscrow. All rights reserved.
            </Text>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
