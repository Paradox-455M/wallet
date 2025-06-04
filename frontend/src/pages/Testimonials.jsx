import React from 'react';
import { Box, Container, VStack, Text, Icon, Heading, useColorModeValue, Grid, GridItem, Avatar, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import Login from './Login';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';

const testimonialsData = [
  {
    name: 'Sarah Johnson',
    title: 'Freelance Designer',
    avatar: '', // Placeholder, replace with actual avatar URL or component if available
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

const TestimonialCard = ({ name, title, avatar, quote, rating }) => {
  return (
    <GridItem
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      color="white"
      _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s"
    >
      <Box display="flex" alignItems="center" mb={4} >
        <Avatar name={name} src={avatar} size="lg" mr={4} />
        <Box>
          <Heading size="md">{name}</Heading>
          <Text fontSize="sm" color="purple.200">{title}</Text>
        </Box>
      </Box>
      <Text mb={4} fontStyle="italic">"{quote}"</Text>
      <Box display="flex" gap={1}>
        {Array(5)
          .fill('')
          .map((_, i) => (
            <Icon key={i} as={StarIcon} color={i < rating ? 'yellow.400' : 'gray.500'} />
          ))}
      </Box>
    </GridItem>
  );
};

const Testimonials = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth();
  const textColor = 'white';

  return (
    <Box minH="100vh" position="relative">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box pt={24} pb={12} px={4}>
        <Container maxW="container.xl" className="absolute inset-0 bg-gradient-to-br from-indigo-700/70 to-purple-700/70 backdrop-blur-sm">
          <Heading as="h1" size="3xl" textAlign="center" mb={4} fontWeight="bold" color="white">
            What Our Users Say
          </Heading>
          <Text fontSize="xl" textAlign="center" mb={12} color="purple.100">
            Trusted by businesses and individuals worldwide
          </Text>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8} >
            {testimonialsData.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Grid>
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
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&#10005;</button>
            </Box>
            <ModalBody p={{ base: 4, md: 8 }}>
              <Login onClose={onClose} modalMode />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Testimonials;