import React from 'react';
import { Box, Container, VStack, Text, Icon, Heading,Button, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import Login from '../pages/Login';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';
const steps = [
  {
    title: 'Step 1: Buyer Starts the Transaction',
    description: 'The buyer enters the amount, item description, and seller’s email. A secure payment link is generated and sent to the buyer.'
  },
  {
    title: 'Step 2: Buyer Sends Payment',
    description: 'The buyer pays through a trusted payment gateway (Stripe or PayPal). The funds are securely held in escrow — not released yet.'
  },
  {
    title: 'Step 3: Seller Uploads the File',
    description: 'The seller receives a secure upload link. They upload the agreed file directly to our system.'
  },
  {
    title: 'Step 4: We Confirm Both Sides',
    description: "As soon as we confirm both the payment and the file: ✅ The file becomes downloadable for the buyer. ✅ The payment is released to the seller.",
  },
  {
    title: 'Step 5: Done. Simple as That.',
    description: 'No scams. No delays. No confusion. Both parties walk away happy — every time.'
  }
];

const HowItWorks = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Box minH="100vh" position="relative">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box pt={24} pb={12} px={4}>
        <Container maxW="container.xl" className='absolute inset-0 bg-gradient-to-br from-indigo-700/70 to-purple-700/70 backdrop-blur-sm'>
          <Text fontSize="4xl" fontWeight="bold" color="white" textAlign="center" mb={8}>
            How It Works — Safe, Simple, and Secure
          </Text>
          <VStack spacing={10} align="stretch">
            {steps.map((step, idx) => (
              <Box as="section" key={idx}>
                <Box display="flex" alignItems="flex-start" background="whiteAlpha.100" backdropFilter="blur(20px)" border="1px solid" borderColor="whiteAlpha.200" p={6} rounded="xl" boxShadow="2xl" _hover={{ transform: 'scale(1.05)' }} transition="all 0.5s">
                  <Box flexShrink={0} w={16} h={16} bg="blue.500" rounded="full" display="flex" alignItems="center" justifyContent="center" color="white" fontSize="2xl" fontWeight="bold" mb={{ base: 4, md: 0 }} mr={{ md: 6 }} boxShadow="lg">
                    {idx + 1}
                  </Box>
                  <Box>
                    <Text fontWeight="bold" fontSize="2xl" mb={2} color="white">{step.title}</Text>
                    {step.description.split('\n').map((line, i) => (
                      <Text key={i} fontSize="md" color={line.startsWith('✅') ? 'green.300' : 'gray.300'} ml={line.startsWith('✅') ? { md: 4 } : 0}>
                        {line}
                      </Text>
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </VStack>
          <Box mt={12} textAlign="center" bg="whiteAlpha.100" backdropFilter="blur(20px)" border="1px solid" borderColor="whiteAlpha.200" p={6} rounded="xl" boxShadow="2xl">
            <Icon as={LockIcon} w={12} h={12} color="green.400" mb={4} mx="auto" />
            <Text fontSize="xl" fontWeight="semibold" color="white">
              Your file and funds are safe — we only release them when both sides are satisfied.
            </Text>
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
    </Box>
  );
};

export default HowItWorks;