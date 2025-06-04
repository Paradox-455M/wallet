import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Avatar, Modal, ModalOverlay, ModalContent, ModalBody, useDisclosure, HStack, Flex, Badge, Icon, Button, Tabs, TabList, TabPanels, Tab, TabPanel, Divider, Tooltip } from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, ArrowForwardIcon, ViewIcon, DownloadIcon, CopyIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';

const statCardStyle = {
  bg: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  borderRadius: 'xl',
  boxShadow: 'xl',
  border: '1px solid',
  borderColor: 'whiteAlpha.200',
  p: 6,
  minW: '150px',
  textAlign: 'center',
  _hover: { transform: 'scale(1.02)' },
  transition: 'all 0.2s'
};

const transactionTableHeader = {
  px: 4,
  py: 2,
  borderBottom: '1px solid',
  borderColor: 'whiteAlpha.200',
  color: 'purple.300',
};

const transactionTableRow = {
  px: 4,
  py: 3,
  borderBottom: '1px solid',
  borderColor: 'whiteAlpha.100',
  color: 'white',
  _hover: {
    bg: 'whiteAlpha.50'
  }
};

const buyerStats = [
  { title: 'Total Transactions', value: '12', icon: '💼' },
  { title: 'Pending Files', value: '3', icon: '⏳' },
  { title: 'Completed Transactions', value: '8', icon: '✅' },
  { title: 'Total Spent', value: '$1,250.00', icon: '💸' }
];

const buyerActiveTransactions = [
  {
    item: 'Design Package.zip',
    seller: 'john@example.com',
    amount: 150.0,
    status: 'AWAITING FILE',
    details: {
      created: 'May 15, 2025',
      expires: '2d 5h',
      expiresText: 'Expires in: 2d 5h',
      expiresColor: 'red.400',
    },
    actions: ['Cancel', 'Copy Link']
  },
  {
    item: 'Marketing Data Set',
    seller: 'anna@xyz.com',
    amount: 70.0,
    status: 'COMPLETE',
    details: {
      created: 'May 10, 2025',
      completed: 'May 12, 2025',
    },
    actions: ['Download File', 'Copy Link']
  },
  {
    item: 'Software License',
    seller: 'software@corp.com',
    amount: 299.0,
    status: 'AWAITING PAYMENT',
    details: {
      created: 'May 18, 2025',
      paymentDue: '1d 2h',
      paymentDueText: 'Payment due: 1d 2h',
      paymentDueColor: 'red.400',
    },
    actions: ['Pay Now', 'Cancel']
  },
  {
    item: 'Project Files',
    seller: 'archive@example.com',
    amount: 20.0,
    status: 'CANCELLED',
    details: {
      created: 'Apr 20, 2025',
      cancelled: 'Apr 22, 2025',
    },
    actions: ['View Details']
  },
];

const statusBadge = (status) => {
  if (status === 'COMPLETE') return <Badge colorScheme="green" fontSize="0.9em" px={3} py={1} borderRadius="md">COMPLETE</Badge>;
  if (status === 'AWAITING FILE') return <Badge colorScheme="yellow" fontSize="0.9em" px={3} py={1} borderRadius="md">AWAITING FILE</Badge>;
  if (status === 'AWAITING PAYMENT') return <Badge colorScheme="blue" fontSize="0.9em" px={3} py={1} borderRadius="md">AWAITING PAYMENT</Badge>;
  if (status === 'CANCELLED') return <Badge colorScheme="red" fontSize="0.9em" px={3} py={1} borderRadius="md">CANCELLED</Badge>;
  return <Badge colorScheme="gray" fontSize="0.9em" px={3} py={1} borderRadius="md">{status}</Badge>;
};

const BuyerTab = () => (
  <Box>
    <Heading fontSize="2xl" color="white" fontWeight="extrabold" mb={6} bg="rgba(255,255,255,0.1)" backdropFilter="blur(10px)" borderRadius="xl" p={4} boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200">Transactional Dashboard</Heading>
    {/* Tabs Navigation */}
    <Tabs variant="unstyled" colorScheme="purple" defaultIndex={0} mb={8}>
      <TabList bg="rgba(255,255,255,0.08)" borderRadius="xl" p={2} mb={6}>
        <Tab _selected={{ color: 'white.400', fontWeight: 'bold', borderBottom: '3px solid', borderColor: 'purple.700' }} fontWeight="bold">🧑‍💼 Buyer View</Tab>
        <Tab _selected={{ color: 'white.400', fontWeight: 'bold', borderBottom: '3px solid', borderColor: 'purple.700' }} fontWeight="bold">🧑‍💼 Seller View</Tab>
        <Tab _selected={{ color: 'white.400', fontWeight: 'bold', borderBottom: '3px solid', borderColor: 'purple.700' }} fontWeight="bold">📊 Transaction Timeline</Tab>
      </TabList>
      <TabPanels>
        <TabPanel px={0}>
          {/* Buyer Summary */}
          <HStack spacing={6} mb={8}>
            {buyerStats.map((stat) => (
              <Box key={stat.title} {...statCardStyle} minW="282px">
                <Text fontSize="sm" color="purple.200" fontWeight="medium">{stat.title}</Text>
                <HStack justify="center" mt={2}>
                  <Text fontSize="3xl">{stat.icon}</Text>
                  <Heading fontSize="2xl" color="white">{stat.value}</Heading>
                </HStack>
              </Box>
            ))}
          </HStack>
          {/* Active Transactions Table */}
          <Box bg="rgba(255,255,255,0.1)" backdropFilter="blur(10px)" borderRadius="2xl" p={6} boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200" _hover={{ transform: 'scale(1.01)' }} transition="all 0.2s">
            <Heading fontSize="lg" color="white" mb={4} fontWeight="bold">Active Transactions</Heading>
            <Box overflowX="auto">
              <Box as="table" w="full" sx={{ borderSpacing: 0 }}>
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Item</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Seller</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="right" color="whiteAlpha.700">Amount</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Status</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Details</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Actions</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {buyerActiveTransactions.map((tx, idx) => (
                    <Box as="tr" key={idx} {...transactionTableRow}>
                      <Box as="td" textAlign="left">{tx.item}</Box>
                      <Box as="td" textAlign="left">
                        <HStack>
                          <Avatar size="xs" name={tx.seller} bg="whiteAlpha.600" color="purple.700" />
                          <Text color="whiteAlpha.800">{tx.seller}</Text>
                        </HStack>
                      </Box>
                      <Box as="td" textAlign="right">${tx.amount.toFixed(2)}</Box>
                      <Box as="td" textAlign="center">{statusBadge(tx.status)}</Box>
                      <Box as="td" textAlign="center">
                        <VStack spacing={1} align="center">
                          <Text fontSize="xs" color="gray.300">Created: {tx.details.created}</Text>
                          {tx.status === 'AWAITING FILE' && <Text fontSize="xs" color={tx.details.expiresColor}>{tx.details.expiresText}</Text>}
                          {tx.status === 'AWAITING PAYMENT' && <Text fontSize="xs" color={tx.details.paymentDueColor}>{tx.details.paymentDueText}</Text>}
                          {tx.status === 'COMPLETE' && <Text fontSize="xs" color="green.300">Completed: {tx.details.completed}</Text>}
                          {tx.status === 'CANCELLED' && <Text fontSize="xs" color="red.300">Cancelled: {tx.details.cancelled}</Text>}
                        </VStack>
                      </Box>
                      <Box as="td" textAlign="center">
                        <HStack spacing={2} justify="center">
                          {tx.actions.includes('Pay Now') && <Button colorScheme="blue" size="sm">Pay Now</Button>}
                          {tx.actions.includes('Cancel') && <Button colorScheme="gray" size="sm" leftIcon={<CloseIcon boxSize={3} />}>Cancel</Button>}
                          {tx.actions.includes('Download File') && <Button colorScheme="purple" size="sm" leftIcon={<DownloadIcon />}>Download File</Button>}
                          {tx.actions.includes('Copy Link') && <Tooltip label="Copy Link"><Button colorScheme="gray" size="sm" leftIcon={<CopyIcon />}>Copy Link</Button></Tooltip>}
                          {tx.actions.includes('View Details') && <Button colorScheme="gray" size="sm" leftIcon={<ViewIcon />}>View Details</Button>}
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel px={0}>
          {/* Seller Summary */}
          <HStack spacing={6} mb={8}>
            {[
              { title: '# of Uploads', value: '25', icon: '🗂️' },
              { title: 'Total Earned', value: '$3,500.00', icon: '💰' },
              { title: 'Pending Payouts', value: '$450.00', icon: '⏳' },
              { title: 'Downloads Completed', value: '150', icon: '📩' }
            ].map((stat) => (
              <Box key={stat.title} {...statCardStyle} minW="282px">
                <Text fontSize="sm" color="purple.200" fontWeight="medium">{stat.title}</Text>
                <HStack justify="center" mt={2}>
                  <Text fontSize="3xl">{stat.icon}</Text>
                  <Heading fontSize="2xl" color="white">{stat.value}</Heading>
                </HStack>
              </Box>
            ))}
          </HStack>
          {/* Upload Tasks Table */}
          <Box bg="rgba(255,255,255,0.1)" backdropFilter="blur(10px)" borderRadius="2xl" p={6} boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200" _hover={{ transform: 'scale(1.01)' }} transition="all 0.2s">
            <Heading fontSize="lg" color="white" mb={4} fontWeight="bold">Upload Tasks</Heading>
            <Box overflowX="auto">
              <Box as="table" w="full" sx={{ borderSpacing: 0 }}>
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Item</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Buyer</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Status</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">File</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Payout</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Actions</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {[
                    {
                      item: 'Codebase.tar',
                      buyer: 'sam@abc.com',
                      status: 'WAITING FOR UPLOAD',
                      file: '--',
                      payout: '--',
                      actions: ['Upload Now', 'Copy Link'],
                      timeLimit: '23h 15m'
                    },
                    {
                      item: 'Logo.ai',
                      buyer: 'mark@example.com',
                      status: 'COMPLETE',
                      file: 'Uploaded',
                      payout: 'Paid ($200)',
                      actions: ['View Details'],
                      paid: true
                    },
                    {
                      item: 'Video Tutorial Series',
                      buyer: 'learner@edu.org',
                      status: 'REFUNDED',
                      file: 'N/A',
                      payout: 'Refunded (-$50)',
                      actions: ['View Details'],
                      refunded: true
                    }
                  ].map((task, idx) => (
                    <Box as="tr" key={idx} {...transactionTableRow}>
                      <Box as="td" textAlign="left" fontWeight="bold">{task.item}</Box>
                      <Box as="td" textAlign="left">{task.buyer}</Box>
                      <Box as="td" textAlign="center">
                        {task.status === 'COMPLETE' && <Badge colorScheme="green" fontSize="0.9em" px={3} py={1} borderRadius="md">COMPLETE</Badge>}
                        {task.status === 'WAITING FOR UPLOAD' && <Badge colorScheme="yellow" fontSize="0.9em" px={3} py={1} borderRadius="md">WAITING FOR UPLOAD</Badge>}
                        {task.status === 'REFUNDED' && <Badge colorScheme="gray" fontSize="0.9em" px={3} py={1} borderRadius="md">REFUNDED</Badge>}
                      </Box>
                      <Box as="td" textAlign="center">
                        {task.file === 'Uploaded' && <><Icon as={CheckCircleIcon} color="green.400" mr={1} />Uploaded</>}
                        {task.file === '--' && '--'}
                        {task.file === 'N/A' && 'N/A'}
                      </Box>
                      <Box as="td" textAlign="center">
                        {task.paid && <><Icon as={CheckCircleIcon} color="green.400" mr={1} />Paid ($200)</>}
                        {task.refunded && <><Icon as={CloseIcon} color="red.400" mr={1} />Refunded (-$50)</>}
                        {!task.paid && !task.refunded && '--'}
                      </Box>
                      <Box as="td" textAlign="center">
                        <HStack spacing={2} justify="center">
                          {task.actions.includes('Upload Now') && <Button colorScheme="blue" size="sm">Upload Now</Button>}
                          {task.actions.includes('Copy Link') && <Tooltip label="Copy Link"><Button colorScheme="gray" size="sm" leftIcon={<CopyIcon />}>Copy Link</Button></Tooltip>}
                          {task.actions.includes('View Details') && <Button colorScheme="gray" size="sm" leftIcon={<ViewIcon />}>View Details</Button>}
                        </HStack>
                        {task.timeLimit && <Text fontSize="xs" color="gray.400" mt={1}>Time limit: {task.timeLimit}</Text>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel px={0}>
          {/* Transaction Timeline View */}
          <Box bg="rgba(255,255,255,0.1)" backdropFilter="blur(10px)" borderRadius="2xl" p={6} boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200" _hover={{ transform: 'scale(1.01)' }} transition="all 0.2s">
            <Heading fontSize="lg" color="white" mb={4} fontWeight="bold">Transaction Timeline View</Heading>
            <Box maxW="700px" mx="auto" mt={8}>
              <Box bg="whiteAlpha.50" borderRadius="xl" p={6} boxShadow="lg" border="1px solid" borderColor="whiteAlpha.200">
                <Text fontWeight="bold" fontSize="lg" color="white" mb={2}>
                  Transaction: #TID123456 (Design Package.zip)
                </Text>
                <Text fontSize="sm" color="gray.300" mb={6}>
                  Buyer: buyer@email.com | Seller: john@example.com
                </Text>
                <VStack align="stretch" spacing={0} position="relative">
                  {/* Timeline Step 1 */}
                  <HStack align="flex-start" spacing={4} position="relative">
                    <Box mt={1}>
                      <Box bg="blue.500" color="white" borderRadius="full" p={2} boxShadow="md">
                        <Icon as={TimeIcon} boxSize={5} />
                      </Box>
                    </Box>
                    <Box flex={1} pb={6} borderLeft="2px solid" borderColor="blue.400" pl={4}>
                      <Text fontWeight="bold" color="white">Transaction Created</Text>
                      <Text fontSize="sm" color="gray.300">May 19, 2025, 9:30 AM</Text>
                    </Box>
                  </HStack>
                  {/* Timeline Step 2 */}
                  <HStack align="flex-start" spacing={4} position="relative">
                    <Box mt={1}>
                      <Box bg="green.400" color="white" borderRadius="full" p={2} boxShadow="md">
                        <Icon as={CheckCircleIcon} boxSize={5} />
                      </Box>
                    </Box>
                    <Box flex={1} pb={6} borderLeft="2px solid" borderColor="green.400" pl={4}>
                      <Text fontWeight="bold" color="white">Payment Received</Text>
                      <Text fontSize="sm" color="gray.300">May 19, 2025, 9:42 AM</Text>
                      <Text fontSize="xs" color="gray.400">Payment ID: PAY_ajk293ksmf9</Text>
                    </Box>
                  </HStack>
                  {/* Timeline Step 3 */}
                  <HStack align="flex-start" spacing={4} position="relative">
                    <Box mt={1}>
                      <Box bg="yellow.400" color="white" borderRadius="full" p={2} boxShadow="md">
                        <Icon as={ArrowForwardIcon} boxSize={5} />
                      </Box>
                    </Box>
                    <Box flex={1} pb={6} borderLeft="2px solid" borderColor="yellow.400" pl={4}>
                      <Text fontWeight="bold" color="white">File Uploaded <Badge colorScheme="yellow" ml={2}>PENDING</Badge></Text>
                      <Text fontSize="sm" color="gray.300">Waiting for seller...</Text>
                      <Text fontSize="xs" color="gray.400">Seller: john@example.com</Text>
                    </Box>
                  </HStack>
                  {/* Timeline Step 4 */}
                  <HStack align="flex-start" spacing={4} position="relative">
                    <Box mt={1}>
                      <Box bg="gray.400" color="white" borderRadius="full" p={2} boxShadow="md">
                        <Icon as={DownloadIcon} boxSize={5} />
                      </Box>
                    </Box>
                    <Box flex={1} pb={6} borderLeft="2px solid" borderColor="gray.400" pl={4}>
                      <Text fontWeight="bold" color="white">File Delivered</Text>
                    </Box>
                  </HStack>
                  {/* Timeline Step 5 */}
                  <HStack align="flex-start" spacing={4} position="relative">
                    <Box mt={1}>
                      <Box bg="gray.400" color="white" borderRadius="full" p={2} boxShadow="md">
                        <Icon as={CheckCircleIcon} boxSize={5} />
                      </Box>
                    </Box>
                    <Box flex={1} pl={4}>
                      <Text fontWeight="bold" color="white">Funds Released</Text>
                    </Box>
                  </HStack>
                </VStack>
              </Box>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel px={0}>
          {/* Seller Summary */}
          <HStack spacing={6} mb={8}>
            {[
              { title: '# of Uploads', value: '25', icon: '🗂️' },
              { title: 'Total Earned', value: '$3,500.00', icon: '💰' },
              { title: 'Pending Payouts', value: '$450.00', icon: '⏳' },
              { title: 'Downloads Completed', value: '150', icon: '📩' }
            ].map((stat) => (
              <Box key={stat.title} {...statCardStyle} minW="282px">
                <Text fontSize="sm" color="purple.200" fontWeight="medium">{stat.title}</Text>
                <HStack justify="center" mt={2}>
                  <Text fontSize="3xl">{stat.icon}</Text>
                  <Heading fontSize="2xl" color="white">{stat.value}</Heading>
                </HStack>
              </Box>
            ))}
          </HStack>
          {/* Upload Tasks Table */}
          <Box bg="rgba(255,255,255,0.1)" backdropFilter="blur(10px)" borderRadius="2xl" p={6} boxShadow="xl" border="1px solid" borderColor="whiteAlpha.200" _hover={{ transform: 'scale(1.01)' }} transition="all 0.2s">
            <Heading fontSize="lg" color="white" mb={4} fontWeight="bold">Upload Tasks</Heading>
            <Box overflowX="auto">
              <Box as="table" w="full" sx={{ borderSpacing: 0 }}>
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Item</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Buyer</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Status</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">File</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Payout</Box>
                    <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Actions</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {[
                    {
                      item: 'Codebase.tar',
                      buyer: 'sam@abc.com',
                      status: 'WAITING FOR UPLOAD',
                      file: '--',
                      payout: '--',
                      actions: ['Upload Now', 'Copy Link'],
                      timeLimit: '23h 15m'
                    },
                    {
                      item: 'Logo.ai',
                      buyer: 'mark@example.com',
                      status: 'COMPLETE',
                      file: 'Uploaded',
                      payout: 'Paid ($200)',
                      actions: ['View Details'],
                      paid: true
                    },
                    {
                      item: 'Video Tutorial Series',
                      buyer: 'learner@edu.org',
                      status: 'REFUNDED',
                      file: 'N/A',
                      payout: 'Refunded (-$50)',
                      actions: ['View Details'],
                      refunded: true
                    }
                  ].map((task, idx) => (
                    <Box as="tr" key={idx} {...transactionTableRow}>
                      <Box as="td" textAlign="left" fontWeight="bold">{task.item}</Box>
                      <Box as="td" textAlign="left">{task.buyer}</Box>
                      <Box as="td" textAlign="center">
                        {task.status === 'COMPLETE' && <Badge colorScheme="green" fontSize="0.9em" px={3} py={1} borderRadius="md">COMPLETE</Badge>}
                        {task.status === 'WAITING FOR UPLOAD' && <Badge colorScheme="yellow" fontSize="0.9em" px={3} py={1} borderRadius="md">WAITING FOR UPLOAD</Badge>}
                        {task.status === 'REFUNDED' && <Badge colorScheme="gray" fontSize="0.9em" px={3} py={1} borderRadius="md">REFUNDED</Badge>}
                      </Box>
                      <Box as="td" textAlign="center">
                        {task.file === 'Uploaded' && <><Icon as={CheckCircleIcon} color="green.400" mr={1} />Uploaded</>}
                        {task.file === '--' && '--'}
                        {task.file === 'N/A' && 'N/A'}
                      </Box>
                      <Box as="td" textAlign="center">
                        {task.paid && <><Icon as={CheckCircleIcon} color="green.400" mr={1} />Paid ($200)</>}
                        {task.refunded && <><Icon as={CloseIcon} color="red.400" mr={1} />Refunded (-$50)</>}
                        {!task.paid && !task.refunded && '--'}
                      </Box>
                      <Box as="td" textAlign="center">
                        <HStack spacing={2} justify="center">
                          {task.actions.includes('Upload Now') && <Button colorScheme="blue" size="sm">Upload Now</Button>}
                          {task.actions.includes('Copy Link') && <Tooltip label="Copy Link"><Button colorScheme="gray" size="sm" leftIcon={<CopyIcon />}>Copy Link</Button></Tooltip>}
                          {task.actions.includes('View Details') && <Button colorScheme="gray" size="sm" leftIcon={<ViewIcon />}>View Details</Button>}
                        </HStack>
                        {task.timeLimit && <Text fontSize="xs" color="gray.400" mt={1}>Time limit: {task.timeLimit}</Text>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box>
);

const Dashboard = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated } = useAuth();

  return (
    <Box minH="100vh" position="relative">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Box pt={24} pb={12} px={2}>
        <Box maxW="1200px" mx="auto">
          <BuyerTab />
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
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&#10005;</button>
          </Box>
          <ModalBody p={{ base: 4, md: 8 }}>
            <Login onClose={onClose} modalMode />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;