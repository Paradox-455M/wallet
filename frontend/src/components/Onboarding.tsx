import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress,
  Icon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';

const Onboarding = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && currentUser) {
      const timeoutId = window.setTimeout(() => {
        onOpen();
      }, 1000);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [currentUser, onOpen]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="lg" isCentered closeOnOverlayClick={false}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(4px)" />
      <ModalContent bg="gray.800" color="white" borderRadius="2xl">
        <ModalCloseButton />
        <ModalBody p={8}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                Step {step} of {totalSteps}
              </Text>
              <Progress value={(step / totalSteps) * 100} colorScheme="purple" borderRadius="full" />
            </Box>

            {step === 1 && (
              <VStack spacing={4} align="stretch" textAlign="center">
                <Icon as={CheckCircleIcon} w={16} h={16} color="purple.400" mx="auto" />
                <Text fontSize="2xl" fontWeight="bold">
                  Welcome to Secure Escrow! 👋
                </Text>
                <Text color="gray.300" fontSize="lg">
                  We're here to help you conduct secure transactions with confidence.
                </Text>
                <Box bg="gray.700" p={4} borderRadius="lg" mt={4}>
                  <Text fontSize="sm" color="gray.300">
                    Your funds are held securely until both parties complete their part of the transaction.
                  </Text>
                </Box>
              </VStack>
            )}

            {step === 2 && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                  How It Works
                </Text>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="purple.400" />
                    <Text as="span" fontWeight="bold">
                      Create Transaction:
                    </Text>
                    <Text as="span" color="gray.300">
                      {' '}
                      Set up a new escrow transaction with buyer and seller details
                    </Text>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="purple.400" />
                    <Text as="span" fontWeight="bold">
                      Payment:
                    </Text>
                    <Text as="span" color="gray.300">
                      {' '}
                      Buyer pays securely through Stripe
                    </Text>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="purple.400" />
                    <Text as="span" fontWeight="bold">
                      File Upload:
                    </Text>
                    <Text as="span" color="gray.300">
                      {' '}
                      Seller uploads the file or delivers the service
                    </Text>
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="purple.400" />
                    <Text as="span" fontWeight="bold">
                      Completion:
                    </Text>
                    <Text as="span" color="gray.300">
                      {' '}
                      Transaction completes automatically when both steps are done
                    </Text>
                  </ListItem>
                </List>
              </VStack>
            )}

            {step === 3 && (
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                  Ready to Get Started?
                </Text>
                <VStack spacing={3} align="stretch">
                  <Box bg="gray.700" p={4} borderRadius="lg">
                    <Text fontWeight="bold" mb={2}>
                      Quick Actions:
                    </Text>
                    <List spacing={2}>
                      <ListItem fontSize="sm" color="gray.300">
                        • Create a new transaction from the dashboard
                      </ListItem>
                      <ListItem fontSize="sm" color="gray.300">
                        • View all your transactions in one place
                      </ListItem>
                      <ListItem fontSize="sm" color="gray.300">
                        • Track transaction progress in real-time
                      </ListItem>
                    </List>
                  </Box>
                  <Box bg="purple.900" p={4} borderRadius="lg" border="1px solid" borderColor="purple.600">
                    <Text fontSize="sm" color="purple.200">
                      💡 <strong>Tip:</strong> You can share transaction links with others to collaborate securely.
                    </Text>
                  </Box>
                </VStack>
              </VStack>
            )}

            <HStack spacing={4} justify="space-between" mt={4}>
              <Button variant="ghost" onClick={handleSkip} color="gray.400" _hover={{ color: 'white' }}>
                Skip
              </Button>
              <Button
                colorScheme="purple"
                rightIcon={step === totalSteps ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                onClick={handleNext}
                size="lg"
              >
                {step === totalSteps ? 'Get Started' : 'Next'}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Onboarding;
