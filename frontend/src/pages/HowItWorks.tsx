import { Box, VStack, Text, Heading, Button, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react';
import Login from '../pages/Login';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';

const steps = [
  {
    title: 'Step 1: Buyer Starts the Transaction',
    description: "The buyer enters the amount, item description, and seller's email. A secure payment link is generated and sent to the buyer.",
  },
  {
    title: 'Step 2: Buyer Sends Payment',
    description: 'The buyer pays through a trusted payment gateway (Stripe or PayPal). The funds are securely held in escrow — not released yet.',
  },
  {
    title: 'Step 3: Seller Uploads the File',
    description: 'The seller receives a secure upload link. They upload the agreed file directly to our system.',
  },
  {
    title: 'Step 4: We Confirm Both Sides',
    description:
      'As soon as we confirm both the payment and the file: ✅ The file becomes downloadable for the buyer. ✅ The payment is released to the seller.',
  },
  {
    title: 'Step 5: Done. Simple as That.',
    description: 'No scams. No delays. No confusion. Both parties walk away happy — every time.',
  },
];

const HowItWorks = () => {
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
                How It Works — Safe, Simple, and Secure
              </Heading>
              <Text color="gray.300" fontSize="lg" fontWeight="medium" mb={6}>
                Follow these simple steps to complete secure transactions
              </Text>
            </Box>

            <VStack spacing={8}>
              {steps.map((step) => (
                <Box
                  key={step.title}
                  w="full"
                  bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                  backdropFilter="blur(20px)"
                  p={8}
                  borderRadius="3xl"
                  boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
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
                  <Text fontWeight="bold" fontSize="xl" color="white" mb={4}>
                    {step.title}
                  </Text>
                  <Text color="gray.300" fontSize="md" lineHeight="1.6">
                    {step.description}
                  </Text>
                </Box>
              ))}
            </VStack>

            <Box textAlign="center" mt={16}>
              <Text fontWeight="semibold" color="white" fontSize="xl" mb={6}>
                🔒 Your security is our top priority
              </Text>
              <Text color="gray.300" fontSize="lg" mb={8}>
                Every transaction is protected with military-grade encryption and secure payment processing
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

export default HowItWorks;
