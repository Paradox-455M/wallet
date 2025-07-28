import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Link,
  Spacer,
  VStack,
  HStack,
  Icon,
  Progress,
  Image,
  Container,
  SimpleGrid,
  useColorModeValue,
  Grid,
  GridItem,
  Input,
  Textarea,
  Avatar,
} from '@chakra-ui/react';
import { LockIcon, CheckCircleIcon, StarIcon, EmailIcon, PhoneIcon } from '@chakra-ui/icons';
import { FaUserCircle, FaShieldAlt, FaHandshake, FaFileContract, FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaBolt, FaGlobe, FaHeadset, FaUniversity, FaMoneyBillWave, FaRegLightbulb } from 'react-icons/fa';
import { IoShieldCheckmark, IoBarChart, IoPeople } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext'; // Added
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import Login from '../pages/Login';
import { Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const bgColor = useColorModeValue('purple.500', 'purple.700');
  const textColor = 'white'; // Consistently white for the purple background
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const cardTextColor = useColorModeValue('gray.700', 'gray.200');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.900');
  const headingColor = useColorModeValue('gray.700', 'white');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth(); // Added
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, currentUser, navigate]);
  return (
    <Box position="relative" minH="100vh" overflowX="hidden">
      {/* Background Gradient and Stars */}
      <Box 
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-2}
        bgGradient="linear(to-br, purple.400, purple.600)"
      >
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </Box>

      {/* Navigation Bar */}
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
              <Button variant="link" color={textColor} onClick={() => window.location.href='/how-it-works'} _hover={{textDecoration: 'underline'}}>How it works</Button>
              <Button variant="link" color={textColor} onClick={() => window.location.href='/features'}_hover={{textDecoration: 'underline'}}>Features</Button>
              <Button variant="link" color={textColor} onClick={() => window.location.href='/testimonials'} _hover={{textDecoration: 'underline'}}>Testimonials</Button>
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
      {/* Login Modal Overlay */}
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
      {/* Hero Section */}
      <Container maxW="container.xl" pt={{base: 16, md: 24}} pb={{base:12, md:20}} color={textColor}>
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          align="center" 
          justify="space-between"
        >
          <VStack spacing={6} align={{ base: 'center', lg: 'flex-start' }} textAlign={{ base: 'center', lg: 'left' }} maxW={{ base: '100%', lg: '50%' }} mb={{base:10, lg:0}}>
            <Heading as="h1" size={{base: '2xl', md: '3xl', lg: '4xl'}} fontWeight="bold">
              Secure digital transactions made simple
            </Heading>
            <Text fontSize={{base: 'lg', md: 'xl'}}>
              Buy and sell with confidence. Your funds and files are protected until both sides deliver.
            </Text>
            <HStack spacing={4} mt={4}>
                <Button
                    as={Link}
                    href="/create-transaction"
                    bg="white"
                    color="purple.600"
                    size="lg"
                    px={8}
                    _hover={{ bg: 'gray.100' }}
                >
                    Start Transaction
                </Button>
                <Button
                    as={Link}
                    variant="outline"
                    borderColor="white"
                    color="white"
                    size="lg"
                    href="/how-it-works"
                    px={8}
                    _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                >
                    How it works
                </Button>
            </HStack>
          </VStack>

          <Box 
            bg={cardBgColor} 
            color={cardTextColor} 
            p={8} 
            borderRadius="xl" 
            boxShadow="2xl" 
            w={{ base: '90%', sm: '80%', md: '450px' }} 
            mt={{ base: 10, lg: 0 }}
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.5s"
          >
            <HStack mb={6}>
              <Icon as={LockIcon} w={6} h={6} color="purple.500" />
              <Heading size="md">Secure Transaction</Heading>
            </HStack>
            
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FaUserCircle} w={6} h={6} color="blue.400" />
                <Box>
                  <Text fontSize="sm" color={subTextColor}>Buyer</Text>
                  <Text fontWeight="bold">John D.</Text>
                </Box>
              </HStack>
              <HStack>
                <Icon as={FaUserCircle} w={6} h={6} color="green.400" />
                <Box>
                  <Text fontSize="sm" color={subTextColor}>Seller</Text>
                  <Text fontWeight="bold">Creative Designs Co.</Text>
                </Box>
              </HStack>
              
              <Box mt={4} pt={4} borderTopWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
                <Text fontSize="sm" color={subTextColor}>Transaction amount</Text>
                <Text fontSize="2xl" fontWeight="bold">$1,250.00</Text>
              </Box>

              <Box mt={4}>
                <Progress value={75} colorScheme="purple" size="sm" borderRadius="md" />
                <Text fontSize="xs" color={subTextColor} mt={1}>75% complete - awaiting file upload</Text>
              </Box>
            </VStack>
          </Box>
        </Flex>
      </Container>

      {/* Trusted by Businesses Section */}
      <Box bg={sectionBgColor} py={{base:12, md:16}}>
        <Container maxW="container.lg">
          <VStack spacing={4} mb={{base:8, md:12}}>
            <Text fontWeight="medium" color={subTextColor} textAlign="center">Trusted by businesses and individuals worldwide</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{base:8, md:10}} textAlign="center">
            <HStack justify="center" spacing={3}>
              <Icon as={IoShieldCheckmark} w={8} h={8} color="purple.500" />
              <Text fontWeight="bold" fontSize="lg" color={headingColor}>256-bit Encryption</Text>
            </HStack>
            <HStack justify="center" spacing={3}>
              <Icon as={IoBarChart} w={8} h={8} color="purple.500" />
              <Text fontWeight="bold" fontSize="lg" color={headingColor}>10,000+ Transactions</Text>
            </HStack>
            <HStack justify="center" spacing={3}>
              <Icon as={IoPeople} w={8} h={8} color="purple.500" />
              <Text fontWeight="bold" fontSize="lg" color={headingColor}>Global Support</Text>
            </HStack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* How SecureEscrow Works Section */}
      <Box py={{base:16, md:20}} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={{base:10, md:16}} textAlign="center">
            <Heading color={headingColor}>How SecureEscrow works</Heading>
            <Text fontSize="lg" color={subTextColor}>A simple 3-step process protects both buyers and sellers</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{base:8, md:10}}>
            {[ 
              { icon: FaHandshake, title: 'Buyer sends money', text: 'The buyer initiates the transaction by securely depositing funds into our escrow system. The money is held safely until the transaction is complete.', step: 1 },
              { icon: FaFileContract, title: 'Seller uploads file', text: 'The seller securely uploads the digital goods to our platform. The files are encrypted and stored safely until the transaction is finalized.', step: 2 },
              { icon: FaShieldAlt, title: 'Both get what they came for', text: 'Once both conditions are met, the buyer receives the files and the seller receives the payment. It\'s a win-win for everyone involved.', step: 3 },
            ].map((item, index) => (
              <Box key={index} textAlign="center" p={8} bg={cardBgColor} borderRadius="xl" boxShadow="lg" pos="relative"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s"
              >
                <Box 
                    bg="purple.100" 
                    color="purple.600" 
                    borderRadius="full" 
                    w={10} h={10} 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    fontSize="xl" 
                    fontWeight="bold"
                    mx="auto"
                    mb={6}
                    border="2px solid" 
                    borderColor="purple.200"
                >
                    {item.step}
                </Box>
                <Icon as={item.icon} w={16} h={16} mb={6} color="purple.500" />
                <Heading size="md" mb={4} color={headingColor}>{item.title}</Heading>
                <Text color={cardTextColor}>{item.text}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Why Choose SecureEscrow Section */}
      <Box bg={sectionBgColor} py={{base:16, md:20}}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={{base:10, md:16}} textAlign="center">
            <Heading color={headingColor}>Why choose SecureEscrow?</Heading>
            <Text fontSize="lg" color={subTextColor}>Built for security, designed for simplicity</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{base:6, md:8}}>
            {[ 
              { icon: FaShieldAlt, title: 'No scams', text: 'Eliminate the risk of fraud. Funds are only released when both parties fulfill their obligations.' },
              { icon: FaBolt, title: 'Fast payouts', text: 'Sellers receive their money quickly through multiple payout options.' },
              { icon: FaRegLightbulb, title: 'Simple process', text: 'Our intuitive interface makes managing escrow transactions effortless.' },
              { icon: FaHeadset, title: '24/7 Support', text: 'Our dedicated support team is available around the clock to assist you.' },
              { icon: FaGlobe, title: 'Global reach', text: 'Conduct secure transactions with anyone, anywhere in the world.' },
              { icon: FaUniversity, title: 'Military-grade security', text: 'Your data and transactions are protected with bank-level encryption.' },
            ].map((feature, index) => (
              <Box
                key={index}
                p={8}
                bg={cardBgColor}
                borderRadius="xl"
                boxShadow="lg"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s"
              >
                <Icon as={feature.icon} w={12} h={12} mb={5} color="purple.500" />
                <Heading size="md" mb={3} color={headingColor}>{feature.title}</Heading>
                <Text color={cardTextColor}>{feature.text}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={{base:16, md:20}} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={{base:10, md:16}} textAlign="center">
            <Heading color={headingColor}>What our users say</Heading>
            <Text fontSize="lg" color={subTextColor}>Trusted by businesses and individuals worldwide</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{base:8, md:10}}>
            {[ 
              { name: 'Sarah Johnson', role: 'Freelance Designer', text: 'SecureEscrow has given me peace of mind... I know I\'ll get paid.', avatar: FaUserCircle },
              { name: 'Michael Chen', role: 'Small Business Owner', text: 'Incredibly easy to use, eliminated payment disputes. Highly recommended!', avatar: FaUserCircle },
              { name: 'David Rodriguez', role: 'Online Course Creator', text: 'Transformed how I sell courses. Builds trust, and I get paid instantly.', avatar: FaUserCircle },
            ].map((testimonial, index) => (
              <Box key={index} p={8} bg={cardBgColor} borderRadius="xl" boxShadow="lg" textAlign="center"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s"
              >
                <Icon as={testimonial.avatar} w={16} h={16} mb={4} color="purple.300" mx="auto" />
                <Heading size="md" mb={1} color={headingColor}>{testimonial.name}</Heading>
                <Text fontSize="sm" color={subTextColor} mb={4}>{testimonial.role}</Text>
                <Text fontStyle="italic" color={cardTextColor} mb={4}>"{testimonial.text}"</Text>
                <HStack justify="center">
                  {[...Array(5)].map((_, i) => <Icon key={i} as={StarIcon} color="yellow.400" />)}
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Ready to Transact Section */}
      <Box bgGradient="linear(to-r, purple.500, purple.700)" py={{base:16, md:24}} color={textColor}>
        <Container maxW="container.md" textAlign="center">
          <Heading size={{base:'xl', md:'2xl'}} mb={4}>Ready to transact with confidence?</Heading>
          <Text fontSize={{base:'lg', md:'xl'}} mb={8}>Join thousands of satisfied users who trust SecureEscrow.</Text>
          <HStack spacing={4} justify="center">
            <Button
                as={Link}
                href="/create-transaction"
                bg="white"
                color="purple.600"
                size="lg"
                px={10}
                _hover={{ bg: 'gray.100' }}
            >
                Start Transaction
            </Button>
            <Button
                variant="outline"
                borderColor="white"
                color="white"
                size="lg"
                px={10}
                _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
                Contact Sales
            </Button>
          </HStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" color="gray.400" py={{base:10, md:16}}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }} gap={{base:8, md:6}}>
            <GridItem>
              <HStack spacing={2} mb={4}>
                <Icon as={LockIcon} w={7} h={7} color="purple.300" />
                <Heading size="md" color="white">SecureEscrow</Heading>
              </HStack>
              <Text fontSize="sm" mb={4}>Secure digital transactions worldwide.</Text>
              <HStack spacing={4}>
                <Link href="#"><Icon as={FaTwitter} w={5} h={5} _hover={{color: 'white'}} /></Link>
                <Link href="#"><Icon as={FaFacebook} w={5} h={5} _hover={{color: 'white'}} /></Link>
                <Link href="#"><Icon as={FaLinkedin} w={5} h={5} _hover={{color: 'white'}} /></Link>
                <Link href="#"><Icon as={FaInstagram} w={5} h={5} _hover={{color: 'white'}} /></Link>
              </HStack>
            </GridItem>

            <GridItem>
              <Heading size="sm" color="white" mb={4}>PRODUCT</Heading>
              <VStack align="start" spacing={2} fontSize="sm">
                <Link href="#" _hover={{color: 'white'}}>Features</Link>
                <Link href="#" _hover={{color: 'white'}}>Pricing</Link>
                <Link href="#" _hover={{color: 'white'}}>API</Link>
                <Link href="#" _hover={{color: 'white'}}>Integrations</Link>
              </VStack>
            </GridItem>

            <GridItem>
              <Heading size="sm" color="white" mb={4}>COMPANY</Heading>
              <VStack align="start" spacing={2} fontSize="sm">
                <Link href="#" _hover={{color: 'white'}}>About</Link>
                <Link href="#" _hover={{color: 'white'}}>Blog</Link>
                <Link href="#" _hover={{color: 'white'}}>Careers</Link>
                <Link href="#" _hover={{color: 'white'}}>Press</Link>
              </VStack>
            </GridItem>

            <GridItem>
              <Heading size="sm" color="white" mb={4}>LEGAL</Heading>
              <VStack align="start" spacing={2} fontSize="sm">
                <Link href="#" _hover={{color: 'white'}}>Privacy</Link>
                <Link href="#" _hover={{color: 'white'}}>Terms</Link>
                <Link href="#" _hover={{color: 'white'}}>Cookie Policy</Link>
                <Link href="#" _hover={{color: 'white'}}>GDPR</Link>
              </VStack>
            </GridItem>

            <GridItem>
              <Heading size="sm" color="white" mb={4}>SUPPORT</Heading>
              <VStack align="start" spacing={2} fontSize="sm">
                <Link href="#" _hover={{color: 'white'}}>Help Center</Link>
                <Link href="#" _hover={{color: 'white'}}>Contact Us</Link>
                <Link href="#" _hover={{color: 'white'}}>Status</Link>
                <Link href="#" _hover={{color: 'white'}}>Security</Link>
              </VStack>
            </GridItem>
          </Grid>
          <Text textAlign="center" mt={10} fontSize="sm" borderTopWidth="1px" borderColor="gray.700" pt={6}>
            &copy; {new Date().getFullYear()} SecureEscrow. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;