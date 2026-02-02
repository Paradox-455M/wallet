import {
  Box,
  VStack,
  Text,
  Icon,
  Heading,
  Grid,
  GridItem,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import Login from './Login';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';

type Testimonial = {
  name: string;
  title: string;
  avatar: string;
  quote: string;
  rating: number;
};

const testimonialsData: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    title: 'Freelance Designer',
    avatar: '',
    quote: "SecureEscrow has given me peace of mind... I know I'll get paid.",
    rating: 5,
  },
  {
    name: 'Michael Chen',
    title: 'Small Business Owner',
    avatar: '',
    quote: 'Incredibly easy to use, eliminated payment disputes. Highly recommended!',
    rating: 5,
  },
  {
    name: 'David Rodriguez',
    title: 'Online Course Creator',
    avatar: '',
    quote: 'Transformed how I sell courses. Builds trust, and I get paid instantly.',
    rating: 4,
  },
  {
    name: 'Alex B.',
    title: 'Software Developer',
    avatar: '',
    quote: 'The API integration was smooth, and their support is top-notch. Made selling licenses a breeze.',
    rating: 5,
  },
  {
    name: 'Maria L.',
    title: 'E-commerce Store Owner',
    avatar: '',
    quote: 'Using SecureEscrow for high-value digital art has increased customer trust significantly.',
    rating: 5,
  },
  {
    name: 'Kevin P.',
    title: 'Online Consultant',
    avatar: '',
    quote: 'No more chasing payments. SecureEscrow handles it all professionally.',
    rating: 5,
  },
];

type TestimonialCardProps = Testimonial;

const TestimonialCard = ({ name, title, avatar, quote, rating }: TestimonialCardProps) => (
  <GridItem
    bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
    backdropFilter="blur(20px)"
    p={8}
    borderRadius="3xl"
    boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
    border="1px solid"
    borderColor="whiteAlpha.200"
    color="white"
    _hover={{
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
      borderColor: 'purple.300',
      bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
      backdropFilter: 'blur(25px)',
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
    <Box display="flex" alignItems="center" mb={6}>
      <Avatar name={name} src={avatar} size="lg" mr={4} />
      <Box>
        <Heading size="md" color="white">
          {name}
        </Heading>
        <Text fontSize="sm" color="purple.200">
          {title}
        </Text>
      </Box>
    </Box>
    <Text mb={6} fontStyle="italic" color="gray.300" lineHeight="1.6">
      &quot;{quote}&quot;
    </Text>
    <Box display="flex" gap={1}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} as={StarIcon} color={i < rating ? 'yellow.400' : 'gray.500'} />
      ))}
    </Box>
  </GridItem>
);

const Testimonials = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden" w="100%">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box position="relative" zIndex={1}>
        <Box maxW="1400px" mx="auto" px={6} py={8}>
          <VStack spacing={12} align="stretch">
            <Box textAlign="center" mb={8} position="relative">
              <Box
                position="absolute"
                top="-20px"
                left="50%"
                transform="translateX(-50%)"
                w="300px"
                h="300px"
                bg="linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)"
                borderRadius="full"
                filter="blur(60px)"
                zIndex={-1}
              />
              <Heading
                size="2xl"
                color="white"
                mb={3}
                bgGradient="linear(to-r, purple.300, blue.300)"
                bgClip="text"
                fontWeight="bold"
                style={{ marginTop: '5%' }}
              >
                What Our Users Say
              </Heading>
              <Text color="gray.300" fontSize="lg" fontWeight="medium" mb={6}>
                Trusted by thousands of users worldwide
              </Text>
            </Box>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
              {testimonialsData.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </Grid>

            <Box textAlign="center" mt={16}>
              <Text fontWeight="semibold" color="white" fontSize="xl" mb={6}>
                Ready to join thousands of satisfied users?
              </Text>
              <Button
                bg="linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)"
                color="white"
                size="lg"
                _hover={{
                  bg: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)',
                }}
                _active={{ transform: 'translateY(0px)' }}
                fontWeight="bold"
                borderRadius="xl"
                px={8}
                py={6}
                transition="all 0.3s"
              >
                Start Your First Transaction
              </Button>
            </Box>
          </VStack>
        </Box>
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

export default Testimonials;
