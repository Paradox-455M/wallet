import React from 'react';
import { Box, Container, Flex, Spacer, HStack, Button, VStack, Text, Icon, Heading, useColorModeValue, SimpleGrid, Image, Alert, AlertIcon, Grid, GridItem, Avatar, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure } from '@chakra-ui/react'; // Added Avatar and Modal related imports
import { Link, useLocation } from 'react-router-dom';
import { LockIcon, CloseIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext'; // Added
import Login from '../pages/Login'; // Added
import Navbar from '../components/Navbar';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import * as random from 'maath/random/dist/maath-random.esm';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import StarryBackground from '../components/StarryBackground';

// const LockIcon = ({ className }) => (
//   <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//     <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//   </svg>
// );


const MenuIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const MoneyBillWaveIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 640 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M608 64H32C14.33 64 0 78.33 0 96v320c0 17.67 14.33 32 32 32h576c17.67 0 32-14.33 32-32V96c0-17.67-14.33-32-32-32zM320 384c-53.02 0-96-42.98-96-96s42.98-96 96-96 96 42.98 96 96-42.98 96-96 96zm0-160c-35.35 0-64 28.65-64 64s28.65 64 64 64 64-28.65 64-64-28.65-64-64-64zm272-96H48c-8.836 0-16 7.164-16 16v32c0 8.836 7.164 16 16 16h544c8.836 0 16-7.164 16-16v-32c0-8.836-7.164-16-16-16zm-48 160H32c-8.836 0-16 7.164-16 16v32c0 8.836 7.164 16 16 16h240c3.135 0 6.158-.9081 8.768-2.537c22.98-14.36 50.8-21.46 79.23-21.46s56.25 7.098 79.23 21.46c2.61 1.629 5.633 2.537 8.768 2.537h240c8.836 0 16-7.164 16-16v-32c0-8.836-7.164-16-16-16z"/>
    </svg>
);
const FileUploadIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M296 384h-80c-13.25 0-24-10.75-24-24V192h-87.75c-17.84 0-26.74-21.54-14.14-34.14l152.2-152.2c7.5-7.5 19.79-7.5 27.28 0l152.2 152.2c12.6 12.6 3.711 34.14-14.14 34.14H320v168c0 13.25-10.75 24-24 24zm216-8v112c0 13.25-10.75 24-24 24H24c-13.25 0-24-10.75-24-24V376c0-13.25 10.75-24 24-24h136v-80c0-17.69 14.31-32 32-32h160c17.69 0 32 14.31 32 32v80h136c13.25 0 24 10.75 24 24z"/>
    </svg>
);
const ExchangeAltIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M377.961 166.039L192 352.039V192H48v128h144v160.039L334.039 320H464V192H320v-25.961zM128 32H0v128h128V32zm384 0H384v128h128V32z"/>
    </svg>
);
const ArrowRightIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
);
const ShieldAltIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-41 0l-192 80A48 48 0 0 0 0 127.9v141.1c0 139.6 100.6 279.3 233.9 340.7a48.49 48.49 0 0 0 44.2 0C411.4 548.3 512 408.6 512 269V127.9a48 48 0 0 0-45.5-44.2zM256 448c-52.9 0-96-43.1-96-96s43.1-96 96-96 96 43.1 96 96-43.1 96-96 96z"/>
    </svg>
);

const BoltIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M374.12 160H224V16c0-8.836-7.163-16-16-16L192.12.0156C188.37.0156 184.87 1.406 182.12 4.125l-176 176C-1.375 187.625-.0001 199.75 8.875 208H160v144c0 8.836 7.163 16 16 16l15.88.0156c3.75 0 7.25-1.406 10-4.125l176-176c7.5-7.5 8.875-19.625 1.375-27.875z"/>
    </svg>
);

const SettingsIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M496 384H16c-8.837 0-16-7.163-16-16v-32c0-8.837 7.163-16 16-16h480c8.837 0 16 7.163 16 16v32c0 8.837-7.163 16-16 16zM16 192h480c8.837 0 16-7.163 16-16v-32c0-8.837-7.163 16-16-16H16c-8.837 0-16 7.163-16 16v32c0 8.837 7.163 16 16 16z"/>
    </svg>
);
const HeadsetIcon = ({className}) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M192 160h-16c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h16c17.67 0 32-14.33 32-32V192c0-17.67-14.33-32-32-32zm160 0h-16c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h16c35.35 0 64-28.65 64-64V224c0-35.35-28.65-64-64-64zM256 0C119.03 0 8 111.03 8 248v16c0 8.836 7.164 16 16 16h32c8.836 0 16-7.164 16-16v-16C72 141.61 153.61 60 256 60s184 81.61 184 188v16c0 8.836 7.164 16 16 16h32c8.836 0 16-7.164 16-16v-16C504 111.03 392.97 0 256 0z"/>
    </svg>
);
const GlobeIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 496 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S385.03 8 248 8zm143.49 352.4c-3.63 8.08-8.35 15.7-13.95 22.93-103.07 134.8-275.11 103.17-372.47-38.29-97.35-141.46-65.62-313.5 37.45-372.47 5.6-3.6 11.21-6.79 17.11-9.59 79.29-37.11 175.84-31.39 247.4 15.9C411.68 118.68 448.16 234.17 424.7 327.3c-10.35 40.1-29.51 75.59-53.21 105.1z"/>
    </svg>
);
const StarIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 576 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"/>
    </svg>
);
const StarHalfAltIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 576 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M288 385.3l-124.3 65.8 23.7-138.6-100.6-98.2 139.2-20.2L288 17.8V385.3zM528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6z"/>
    </svg>
);
const TwitterIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>
    </svg>
);
const FacebookIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/>
    </svg>
);
const LinkedinIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 53.79-54.3c29.7 0 53.79 24.5 53.79 54.3a53.79 53.79 0 0 1-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/>
    </svg>
);
const InstagramIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.3 26.2 58 34.4 93.9 36.2 37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
    </svg>
);
const UserIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
    </svg>
);
const UserTieIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm96 64H32c-17.67 0-32 14.33-32 32v28.16C0 449.38 34.62 480 75.84 480H192v-48c0-17.67 14.33-32 32-32s32 14.33 32 32v48h116.16c41.22 0 75.84-30.62 75.84-67.84V352c0-17.67-14.33-32-32-32z"/>
    </svg>
);
const UserGraduateIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 640 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M223.75 130.75L320 200l96.25-69.25L320 64l-96.25 66.75zM320 234.5L176 152V99.02L144 79.62V152c0 12.38 3.75 24.09 10.62 34L320 320l165.38-134c6.87-9.91 10.62-21.62 10.62-34V79.62L464 99.02V152L320 234.5zM576 128c0 35.35-80.38 64-192 64s-192-28.65-192-64s80.38-64 192-64s192 28.65 192 64zM0 352v32c0 35.35 80.38 64 192 64s192-28.65 192-64v-32H0zm640 32v-32H448v32c0 35.35-80.38 64-192 64s-192-28.65-192-64z"/>
    </svg>
);
const CheckCircleIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628 0z"/>
    </svg>
);

const features = [
  {
    icon: ShieldAltIcon,
    title: 'No scams',
    description: 'Eliminate the risk of fraud. Funds are only released when both parties fulfill their obligations.'
  },
  {
    icon: BoltIcon,
    title: 'Fast payouts',
    description: 'Sellers receive their money quickly through multiple payout options.'
  },
  {
    icon: SettingsIcon,
    title: 'Simple process',
    description: 'Our intuitive interface makes managing escrow transactions effortless.'
  },
  {
    icon: HeadsetIcon,
    title: '24/7 Support',
    description: 'Our dedicated support team is available around the clock to assist you.'
  },
  {
    icon: GlobeIcon,
    title: 'Global reach',
    description: 'Conduct secure transactions with anyone, anywhere in the world.'
  },
  {
    icon: LockIcon,
    title: 'Military-grade security',
    description: 'Your data and transactions are protected with bank-level encryption.'
  }
];

const deepDives = [
  {
    title: 'Security You Can Trust',
    what: 'AES-256 file encryption, secure data-at-rest, Stripe’s PCI-DSS-certified payments.',
    why: 'Even if our servers were compromised, your assets remain locked in an encrypted vault.',
    illustration: '/illustrations/security.svg'
  },
  {
    title: 'Lightning-Fast Turnaround',
    what: 'Webhooks detect payment and upload events in <1s, auto-release process in <2s.',
    why: 'No waiting—buyers download immediately, sellers get paid the moment they finish their job.',
    illustration: '/illustrations/lightning.svg'
  },
  {
    title: 'Built-In Dispute Logic',
    what: 'Time-locks, auto-refund rules, manual dispute flagging.',
    why: 'Edge-case protection means fewer chargebacks and happier customers.',
    illustration: '/illustrations/dispute.svg'
  }
];

const faqs = [
  {
    q: 'What if the seller never uploads?',
    a: 'You’re refunded automatically after 24 hrs.'
  },
  {
    q: 'How do I know the file isn’t corrupted?',
    a: 'We verify the file’s SHA-256 hash against the seller’s commitment.'
  },
  {
    q: 'Are there any hidden fees?',
    a: 'No—our standard fee is 2% per transaction, all-in.'
  }
];

const logos = [
  { name: 'DesignerCo', src: '/logos/designerco.svg' },
  { name: 'DataMarts', src: '/logos/datamarts.svg' },
  { name: 'CodeCraft', src: '/logos/codecraft.svg' }
];


const Features = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, currentUser } = useAuth();
  return (
    <Box minH="100vh" position="relative">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box pt={24} pb={12} px={4}>
        <Container maxW="container.xl">
          <Heading fontSize="4xl" fontWeight="bold" color="white" textAlign="center" mb={4}>
            Why Choose SecureEscrow?
          </Heading>
          <Text color="whiteAlpha.800" textAlign="center" mb={8}>
            Built for security, designed for simplicity
          </Text>
          <Box textAlign="center" mb={10}>
            <Button colorScheme="whiteAlpha" bg="white" color="purple.600" _hover={{ bg: 'gray.100' }} size="lg" rightIcon={<ArrowRightIcon className="chakra-icon" />}>Start a Free Transaction</Button>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={8}>
            {features.slice(0, 3).map((feature, idx) => (
              <Box key={feature.title} bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" p={6} rounded="xl" boxShadow="2xl" textAlign="center" _hover={{ transform: 'scale(1.05)' }} transition="all 0.5s">
                <Icon as={feature.icon} w={10} h={10} color="purple.300" mb={4} />
                <Text fontWeight="bold" fontSize="xl" color="white" mb={2}>{feature.title}</Text>
                <Text color="gray.200">{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} mt={10}>
            {features.map((feature, index) => (
              <Box
                key={index}
                p={6}
                rounded="xl"
                boxShadow="2xl"
                bg="whiteAlpha.100"
                backdropFilter="blur(20px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                textAlign="center"
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s"
              >
                <Icon as={feature.icon} w={10} h={10} color="purple.300" mb={4} />
                <Text fontWeight="bold" fontSize="xl" color="white" mb={2}>{feature.title}</Text>
                <Text color="gray.200">{feature.description}</Text>
              </Box>
            ))}
          </SimpleGrid>
         
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
      {/* How People Use SecureEscrow Section */}
      <Container maxW="container.xl" mt={16}>
          <Heading fontSize="3xl" color="white" textAlign="center" mb={10}>How People Use SecureEscrow</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box bg="rgba(255,255,255,0.10)" borderRadius="2xl" boxShadow="2xl" p={8} textAlign="center" _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Icon as={UserIcon} w={12} h={12} color="purple.200" mb={4} />
              <Text fontWeight="bold" fontSize="xl" color="white" mb={2}>Freelancers</Text>
              <Text color="gray.200">Getting paid safely for web development, design, writing, and other project-based work. No more chasing invoices!</Text>
            </Box>
            <Box bg="rgba(255,255,255,0.10)" borderRadius="2xl" boxShadow="2xl" p={8} textAlign="center" _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Icon as={UserGraduateIcon} w={12} h={12} color="purple.200" mb={4} />
              <Text fontWeight="bold" fontSize="xl" color="white" mb={2}>Digital Artists</Text>
              <Text color="gray.200">Selling artwork, NFT commissions, or custom digital creations securely, ensuring payment upon delivery.</Text>
            </Box>
            <Box bg="rgba(255,255,255,0.10)" borderRadius="2xl" boxShadow="2xl" p={8} textAlign="center" _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Icon as={UserTieIcon} w={12} h={12} color="purple.200" mb={4} />
              <Text fontWeight="bold" fontSize="xl" color="white" mb={2}>Agencies</Text>
              <Text color="gray.200">Using escrow for milestone-based contracts with clients, ensuring smooth project flow and timely payments.</Text>
            </Box>
          </SimpleGrid>
        </Container>
      <Box pt={24} pb={12} px={4}>
        <Container maxW="container.xl">
<Box bg="rgba(255, 255, 255, 0.1)" backdropFilter="blur(10px)" p={8} borderRadius="xl" boxShadow="xl" color="white" _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
          <Heading as="h2" size="xl" textAlign="center" mb={8} fontWeight="bold" >
            Why Not Just Use PayPal or Venmo?
          </Heading>
          <Table variant="unstyled">
            <Tbody>
              <Tr>
                <Th color="white" fontSize="lg">Feature</Th>
                <Th color="white" fontSize="lg" textAlign="center">SecureEscrow</Th>
                <Th color="white" fontSize="lg" textAlign="center">PayPal/Venmo (Standard)</Th>
              </Tr>
              <Tr>
                <Td>Holds payment in escrow</Td>
                <Td textAlign="center"><Icon as={CheckCircleIcon} w={5} h={5} color="green.400" /> Yes</Td>
                <Td textAlign="center"><Icon as={CloseIcon} w={5} h={5} color="red.400" /> No (Limited)</Td>
              </Tr>
              <Tr>
                <Td>Milestone-based payments</Td>
                <Td textAlign="center"><Icon as={CheckCircleIcon} w={5} h={5} color="green.400" /> Yes</Td>
                <Td textAlign="center"><Icon as={CloseIcon} w={5} h={5} color="red.400" /> No</Td>
              </Tr>
              <Tr>
                <Td>Fraud protection for both parties</Td>
                <Td textAlign="center"><Icon as={CheckCircleIcon} w={5} h={5} color="green.400" /> Yes</Td>
                <Td textAlign="center"><Icon as={WarningIcon} w={5} h={5} color="yellow.400" /> Varies (Often buyer-centric)</Td>
              </Tr>
              <Tr>
                <Td>Dispute resolution</Td>
                <Td textAlign="center"><Icon as={CheckCircleIcon} w={5} h={5} color="green.400" /> Dedicated</Td>
                <Td textAlign="center"><Icon as={WarningIcon} w={5} h={5} color="yellow.400" /> Standard Process</Td>
              </Tr>
              <Tr>
                <Td>24/7 Dedicated Support</Td>
                <Td textAlign="center"><Icon as={CheckCircleIcon} w={5} h={5} color="green.400" /> Yes</Td>
                <Td textAlign="center"><Icon as={CloseIcon} w={5} h={5} color="red.400" /> Limited</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
          {/* Stats Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={12}>
            <Box textAlign="center"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Text fontSize="3xl" fontWeight="bold" color="purple.100">$2M+</Text>
              <Text color="whiteAlpha.800">Secured Through Escrow</Text>
            </Box>
            <Box textAlign="center"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Text fontSize="3xl" fontWeight="bold" color="purple.100">1,200+</Text>
              <Text color="whiteAlpha.800">Trusted Creators & Clients</Text>
            </Box>
            <Box textAlign="center"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
              <Text fontSize="3xl" fontWeight="bold" color="purple.100">40+</Text>
              <Text color="whiteAlpha.800">Operating in Countries</Text>
            </Box>
          </SimpleGrid>
          {/* Pricing Section */}
          <Box bg="rgba(255,255,255,0.12)" borderRadius="2xl" boxShadow="2xl" p={8} mb={12} textAlign="center"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
            <Heading fontSize="2xl" color="white" mb={2}>Fair & Transparent Pricing</Heading>
            <Text color="whiteAlpha.900" mb={2}>No upfront costs or hidden charges. We believe in simple, straightforward fees.</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.100" mb={2}>1% – 2.5%</Text>
            <Text color="whiteAlpha.800" mb={4}>Escrow service fee, taken only on successful payout.</Text>
            <Button colorScheme="whiteAlpha" variant="outline" borderColor="white" color="white" _hover={{ bg: 'whiteAlpha.200' }} size="lg">View Full Pricing Details</Button>
          </Box>
          {/* FAQ Accordion */}
          <Box mb={12}>
            <Heading fontSize="2xl" color="white" mb={4}>Frequently Asked Questions</Heading>
            <VStack spacing={4} align="stretch">
              <Box bg="rgba(255,255,255,0.10)" borderRadius="xl" p={4} boxShadow="md" _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
                <Text color="white" fontWeight="bold">What happens if one party doesn’t fulfill their side?</Text>
                <Text color="whiteAlpha.800">Funds are refunded if obligations aren’t met by either party.</Text>
              </Box>
              <Box bg="rgba(255,255,255,0.10)" borderRadius="xl" p={4} boxShadow="md"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
                <Text color="white" fontWeight="bold">Can I cancel a transaction?</Text>
                <Text color="whiteAlpha.800">Yes, transactions can be cancelled before both sides complete their steps.</Text>
              </Box>
              <Box bg="rgba(255,255,255,0.10)" borderRadius="xl" p={4} boxShadow="md"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
                <Text color="white" fontWeight="bold">How long do payouts take?</Text>
                <Text color="whiteAlpha.800">Payouts are processed within 1-2 business days after completion.</Text>
              </Box>
              <Box bg="rgba(255,255,255,0.10)" borderRadius="xl" p={4} boxShadow="md"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
                <Text color="white" fontWeight="bold">What are the fees?</Text>
                <Text color="whiteAlpha.800">Fees range from 1% to 2.5% depending on transaction size and method.</Text>
              </Box>
            </VStack>
          </Box>
          {/* AI Assistant Card */}
          <Box bg="rgba(255,255,255,0.13)" borderRadius="2xl" boxShadow="2xl" p={8} mb={12} textAlign="center"_hover={{ transform: 'scale(1.05)' }}
                transition="all 0.5s">
            <Heading fontSize="xl" color="white" mb={2}>✨ AI Assistant</Heading>
            <Text color="whiteAlpha.900" mb={4}>Have a specific question about escrow? Ask our AI!</Text>
            <Box mb={4}>
              <input style={{width:'100%',padding:'16px',borderRadius:'8px',border:'none',background:'rgba(255,255,255,0.08)',color:'#fff',fontSize:'1rem'}} placeholder="Type your question here... e.g., 'How does SecureEscrow handle digital goods delivery?'" />
            </Box>
            <Button colorScheme="whiteAlpha" bg="white" color="purple.600" _hover={{ bg: 'gray.100' }} size="lg">Ask AI Assistant</Button>
          </Box>
        </Container>
        {/* How People Use SecureEscrow Section */}
        <Box textAlign="center" mt={8}>
            <Text fontWeight="semibold" color="white" fontSize="xl" mb={4}>Ready to transact with confidence?</Text>
            <HStack spacing={4} justify="center">
              <Button colorScheme="whiteAlpha" bg="white" color="purple.600" _hover={{ bg: 'gray.100' }} size="lg">Create Your First Escrow</Button>
              
            </HStack>
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
    </Box>
  );
};

export default Features;

