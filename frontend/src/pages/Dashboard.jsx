import React, { useState, useRef } from 'react';
import { 
  Box, VStack, Heading, Text, Avatar, Modal, ModalOverlay, ModalContent, ModalBody, 
  useDisclosure, HStack, Flex, Badge, Icon, Button, Tabs, TabList, TabPanels, Tab, 
  TabPanel, Divider, Tooltip, useToast, Progress, Input,
  CircularProgress, CircularProgressLabel
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, TimeIcon, ArrowForwardIcon, ViewIcon, DownloadIcon, CopyIcon, 
  CloseIcon, AttachmentIcon, ArrowUpIcon 
} from '@chakra-ui/icons';
import { FiUpload, FiUploadCloud } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';
import axios from 'axios';

const statCardStyle = {
  bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  backdropFilter: 'blur(20px)',
  color: 'white',
  borderRadius: '2xl',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  border: '1px solid',
  borderColor: 'whiteAlpha.300',
  p: 8,
  minW: '200px',
  textAlign: 'center',
  _hover: { 
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
    borderColor: 'purple.300'
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden'
};

const transactionTableHeader = {
  px: 6,
  py: 4,
  borderBottom: '2px solid',
  borderColor: 'whiteAlpha.300',
  color: 'purple.200',
  fontWeight: 'bold',
  fontSize: 'sm',
  textTransform: 'uppercase',
  letterSpacing: 'wider'
};

const transactionTableRow = {
  px: 6,
  py: 4,
  borderBottom: '1px solid',
  borderColor: 'whiteAlpha.100',
  color: 'white',
  _hover: {
    bg: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    transform: 'translateX(4px)',
    transition: 'all 0.2s ease'
  },
  transition: 'all 0.2s ease'
};

const statusBadge = (status) => {
  const badgeStyles = {
    COMPLETE: {
      bg: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
    },
    'AWAITING FILE': {
      bg: 'linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(236, 201, 75, 0.3)'
    },
    'AWAITING PAYMENT': {
      bg: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
    },
    CANCELLED: {
      bg: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)'
    }
  };

  const style = badgeStyles[status] || {
    bg: 'linear-gradient(135deg, #718096 0%, #4A5568 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(113, 128, 150, 0.3)'
  };

  return (
    <Badge
      fontSize="0.8em"
      px={4}
      py={2}
      borderRadius="full"
      fontWeight="bold"
      letterSpacing="wider"
      textTransform="uppercase"
      {...style}
    >
      {status}
    </Badge>
  );
};

const Dashboard = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [buyerData, setBuyerData] = useState({ transactions: [], statistics: {} });
  const [sellerData, setSellerData] = useState({ transactions: [], statistics: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const { currentUser, isAuthenticated } = useAuth();

  // Fetch buyer data
  const fetchBuyerData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching buyer data with token:', token ? 'present' : 'missing');
      const response = await axios.get('/api/transactions/buyer-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Buyer data response:', response.data);
      setBuyerData(response.data);
    } catch (error) {
      console.error('Error fetching buyer data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch buyer data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fetch seller data
  const fetchSellerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/transactions/seller-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSellerData(response.data);
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch seller data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      console.log('Loading dashboard data...');
      setLoading(true);
      try {
        await Promise.all([fetchBuyerData(), fetchSellerData()]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper functions for buyer view
  const getBuyerStats = () => {
    const stats = buyerData.statistics || {};
    return [
      { title: 'Total Transactions', value: stats.totalTransactions || 0, icon: '📊' },
      { title: 'Pending Files', value: stats.pendingFiles || 0, icon: '⏳' },
      { title: 'Completed', value: stats.completedTransactions || 0, icon: '✅' },
      { title: 'Total Spent', value: `$${(stats.totalSpent || 0).toFixed(2)}`, icon: '💰' }
    ];
  };

  const getBuyerTransactions = () => {
    return (buyerData.transactions || []).map(transaction => ({
      id: transaction.id,
      item: transaction.item_description,
      seller: transaction.seller_email,
      amount: parseFloat(transaction.amount),
      status: getTransactionStatus(transaction),
      details: {
        created: new Date(transaction.created_at).toLocaleDateString(),
        expiresText: 'Expires in 2 days',
        expiresColor: 'yellow.300',
        paymentDueText: 'Payment due in 1 day',
        paymentDueColor: 'red.300',
        completed: new Date(transaction.completed_at || transaction.updated_at).toLocaleDateString(),
        cancelled: new Date(transaction.updated_at).toLocaleDateString()
      },
      actions: getTransactionActions(transaction)
    }));
  };

  // Helper functions for seller view
  const getSellerStats = () => {
    const stats = sellerData.statistics || {};
    return [
      { title: '# of Uploads', value: stats.totalUploads || 0, icon: '🗂️' },
      { title: 'Total Earned', value: `$${(stats.totalEarned || 0).toFixed(2)}`, icon: '💰' },
      { title: 'Pending Payouts', value: `$${(stats.pendingPayouts || 0).toFixed(2)}`, icon: '⏳' },
      { title: 'Downloads Completed', value: stats.downloadsCompleted || 0, icon: '📩' }
    ];
  };

  const getSellerTransactions = () => {
    return (sellerData.transactions || []).map(transaction => ({
      id: transaction.id,
      item: transaction.item_description,
      buyer: transaction.buyer_email,
      amount: parseFloat(transaction.amount),
      status: getTransactionStatus(transaction),
      file: transaction.file_uploaded ? 'Uploaded' : '--',
      payout: getPayoutStatus(transaction),
      actions: getTransactionActions(transaction),
      timeLimit: '23h 15m' // This would be calculated based on created_at + expiry
    }));
  };

  // Helper functions for transaction processing
  const getTransactionStatus = (transaction) => {
    if (transaction.status === 'completed') return 'COMPLETE';
    if (transaction.payment_received && !transaction.file_uploaded) return 'AWAITING FILE';
    if (!transaction.payment_received) return 'AWAITING PAYMENT';
    if (transaction.status === 'cancelled') return 'CANCELLED';
    return 'PENDING';
  };

  const getPayoutStatus = (transaction) => {
    if (transaction.status === 'completed') return `Paid ($${transaction.amount})`;
    if (transaction.status === 'cancelled') return `Refunded (-$${transaction.amount})`;
    return '--';
  };

  const getTransactionActions = (transaction) => {
    const actions = [];
    const status = getTransactionStatus(transaction);
    
    if (status === 'AWAITING PAYMENT') {
      actions.push('Pay Now');
      actions.push('Cancel');
    } else if (status === 'AWAITING FILE' && activeTab === 1) { // Seller view
      actions.push('Upload Now');
    } else if (status === 'COMPLETE') {
      actions.push('Download File');
      actions.push('View Details');
    } else if (status === 'AWAITING FILE' && activeTab === 0) { // Buyer view
      actions.push('View Details');
    }
    
    actions.push('Copy Link');
    return actions;
  };

  // File upload handlers
  const handleFileUpload = async (file, taskId) => {
    if (!taskId || taskId.startsWith('task-')) {
      toast({
        title: 'Warning',
        description: 'This is a demo transaction. Use real transaction IDs for file upload.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/transactions/${taskId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      toast({
        title: 'Success',
        description: 'File uploaded successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh data after upload
      if (activeTab === 1) {
        fetchSellerData();
      } else {
        fetchBuyerData();
      }

      setUploadModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], selectedTask?.id);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      toast({
        title: 'Uploading...',
        description: `Uploading ${file.name}`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      handleFileUpload(file, selectedTask?.id);
    }
    e.target.value = ''; // Reset input
  };

  const openUploadModal = (task) => {
    setSelectedTask(task);
    setUploadModalOpen(true);
  };

  const handleDirectFileUpload = (task) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Fallback: create a temporary input
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileUpload(e.target.files[0], task.id);
        }
        document.body.removeChild(input);
      };
      document.body.appendChild(input);
      input.click();
    }
  };

  // Transaction action handlers
  const handlePayNow = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transactions/${transactionId}/pay`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast({
        title: 'Success',
        description: 'Payment processed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      fetchBuyerData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transactions/${transactionId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast({
        title: 'Success',
        description: 'Transaction cancelled successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (activeTab === 0) {
        fetchBuyerData();
      } else {
        fetchSellerData();
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel transaction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDownloadFile = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/transactions/${transactionId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Open download URL in new tab
      window.open(response.data.downloadUrl, '_blank');
      
      toast({
        title: 'Success',
        description: 'Download started!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCopyLink = (transactionId) => {
    const link = `${window.location.origin}/transaction/${transactionId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Transaction link copied to clipboard',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!currentUser || !isAuthenticated) {
    return <Login />;
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative">
      <StarryBackground />
      <Navbar />
      <Box position="relative" zIndex={1}>
        <Box maxW="1400px" mx="auto" px={6} py={8}>
          <VStack spacing={8} align="stretch">
            {/* Enhanced Header */}
            <Box textAlign="center" mb={8} position="relative">
              <Box
                position="absolute"
                top="-20px"
                left="50%"
                transform="translateX(-50%)"
                w="200px"
                h="200px"
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
              >
                Dashboard
              </Heading>
              <Text color="gray.300" fontSize="lg" fontWeight="medium">
                Welcome back, <Text as="span" color="purple.300" fontWeight="bold">{currentUser.email}</Text>
              </Text>
              <Text color="gray.400" fontSize="sm" mt={2}>
                Manage your transactions and track your progress
              </Text>
            </Box>

            {/* Enhanced Tabs */}
            <Tabs variant="soft-rounded" colorScheme="purple" onChange={setActiveTab}>
              <TabList 
                justifyContent="center" 
                mb={8}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="xl"
                p={2}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <Tab 
                  color="white" 
                  _selected={{ 
                    bg: 'linear-gradient(135deg, purple.500 0%, blue.500 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                  }}
                  _hover={{
                    bg: 'whiteAlpha.100'
                  }}
                  fontWeight="medium"
                  px={6}
                  py={3}
                  borderRadius="lg"
                  transition="all 0.2s"
                >
                  Buyer View
                </Tab>
                <Tab 
                  color="white" 
                  _selected={{ 
                    bg: 'linear-gradient(135deg, purple.500 0%, blue.500 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                  }}
                  _hover={{
                    bg: 'whiteAlpha.100'
                  }}
                  fontWeight="medium"
                  px={6}
                  py={3}
                  borderRadius="lg"
                  transition="all 0.2s"
                >
                  Seller View
                </Tab>
                <Tab 
                  color="white" 
                  _selected={{ 
                    bg: 'linear-gradient(135deg, purple.500 0%, blue.500 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                  }}
                  _hover={{
                    bg: 'whiteAlpha.100'
                  }}
                  fontWeight="medium"
                  px={6}
                  py={3}
                  borderRadius="lg"
                  transition="all 0.2s"
                >
                  Timeline
                </Tab>
              </TabList>

              <TabPanels>
                {/* Buyer Tab */}
                <TabPanel px={0}>
                  {/* Buyer Summary */}
                  <HStack spacing={6} mb={8}>
                    {getBuyerStats().map((stat) => (
                      <Box key={stat.title} {...statCardStyle} minW="282px">
                        <Text fontSize="sm" color="purple.200" fontWeight="medium">{stat.title}</Text>
                        <HStack justify="center" mt={2}>
                          <Text fontSize="3xl">{stat.icon}</Text>
                          <Heading fontSize="2xl" color="white">{stat.value}</Heading>
                        </HStack>
                      </Box>
                    ))}
                  </HStack>
                  {/* Enhanced Active Transactions Table */}
                  <Box 
                    bg="linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)" 
                    backdropFilter="blur(20px)" 
                    borderRadius="3xl" 
                    p={8} 
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)" 
                    border="1px solid" 
                    borderColor="whiteAlpha.200" 
                    _hover={{ 
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                      borderColor: 'purple.300'
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
                    <Heading 
                      fontSize="xl" 
                      color="white" 
                      mb={6} 
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <Box
                        w="8px"
                        h="8px"
                        bg="purple.400"
                        borderRadius="full"
                        boxShadow="0 0 12px rgba(147, 51, 234, 0.6)"
                      />
                      Active Transactions
                    </Heading>
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
                          {loading ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={8}>
                                <Text color="gray.400">Loading transactions...</Text>
                              </Box>
                            </Box>
                          ) : getBuyerTransactions().length === 0 ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={8}>
                                <VStack spacing={4}>
                                  <Text color="gray.400">No transactions found</Text>
                                  <Button 
                                    colorScheme="purple" 
                                    onClick={() => window.location.href = '/create-transaction'}
                                  >
                                    Create Your First Transaction
                                  </Button>
                                </VStack>
                              </Box>
                            </Box>
                          ) : getBuyerTransactions().map((tx, idx) => (
                            <Box as="tr" key={tx.id || idx} {...transactionTableRow}>
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
                                  {tx.actions.includes('Pay Now') && (
                                    <Button 
                                      bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
                                      color="white"
                                      size="sm"
                                      onClick={() => handlePayNow(tx.id)}
                                      _hover={{
                                        bg: 'linear-gradient(135deg, #3182CE 0%, #2C5282 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)'
                                      }}
                                      _active={{
                                        transform: 'translateY(0px)'
                                      }}
                                      fontWeight="bold"
                                      borderRadius="lg"
                                      px={4}
                                      py={2}
                                      transition="all 0.2s"
                                    >
                                      Pay Now
                                    </Button>
                                  )}
                                  {tx.actions.includes('Cancel') && (
                                    <Button 
                                      bg="linear-gradient(135deg, #718096 0%, #4A5568 100%)"
                                      color="white"
                                      size="sm" 
                                      leftIcon={<CloseIcon boxSize={3} />}
                                      onClick={() => handleCancelTransaction(tx.id)}
                                      _hover={{
                                        bg: 'linear-gradient(135deg, #4A5568 0%, #2D3748 100%)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(113, 128, 150, 0.4)'
                                      }}
                                      _active={{
                                        transform: 'translateY(0px)'
                                      }}
                                      fontWeight="bold"
                                      borderRadius="lg"
                                      px={4}
                                      py={2}
                                      transition="all 0.2s"
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  {tx.actions.includes('Download File') && (
                                    <Button 
                                      colorScheme="purple" 
                                      size="sm" 
                                      leftIcon={<DownloadIcon />}
                                      onClick={() => handleDownloadFile(tx.id)}
                                    >
                                      Download File
                                    </Button>
                                  )}
                                  {tx.actions.includes('Copy Link') && (
                                    <Tooltip label="Copy Link">
                                      <Button 
                                        bg="linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)"
                                        color="white"
                                        size="sm" 
                                        leftIcon={<CopyIcon />}
                                        onClick={() => handleCopyLink(tx.id)}
                                        _hover={{
                                          bg: 'linear-gradient(135deg, #805AD5 0%, #6B46C1 100%)',
                                          transform: 'translateY(-1px)',
                                          boxShadow: '0 4px 12px rgba(159, 122, 234, 0.4)'
                                        }}
                                        _active={{
                                          transform: 'translateY(0px)'
                                        }}
                                        fontWeight="bold"
                                        borderRadius="lg"
                                        px={4}
                                        py={2}
                                        transition="all 0.2s"
                                      >
                                        Copy Link
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {tx.actions.includes('View Details') && (
                                    <Button 
                                      colorScheme="gray" 
                                      size="sm" 
                                      leftIcon={<ViewIcon />}
                                    >
                                      View Details
                                    </Button>
                                  )}
                                </HStack>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </TabPanel>

                {/* Seller Tab */}
                <TabPanel px={0}>
                  {/* Seller Summary */}
                  <HStack spacing={6} mb={8}>
                    {getSellerStats().map((stat) => (
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
                          {loading ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={8}>
                                <Text color="gray.400">Loading transactions...</Text>
                              </Box>
                            </Box>
                          ) : getSellerTransactions().length === 0 ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={8}>
                                <VStack spacing={4}>
                                  <Text color="gray.400">No upload tasks found</Text>
                                  <Text color="gray.500" fontSize="sm">Transactions will appear here when buyers make payments</Text>
                                </VStack>
                              </Box>
                            </Box>
                          ) : getSellerTransactions().map((task, idx) => (
                            <Box as="tr" key={task.id || idx} {...transactionTableRow}>
                              <Box as="td" textAlign="left" fontWeight="bold">{task.item}</Box>
                              <Box as="td" textAlign="left">{task.buyer}</Box>
                              <Box as="td" textAlign="center">{statusBadge(task.status)}</Box>
                              <Box as="td" textAlign="center">
                                {task.file === 'Uploaded' && <><Icon as={CheckCircleIcon} color="green.400" mr={1} />Uploaded</>}
                                {task.file === '--' && '--'}
                                {task.file === 'N/A' && 'N/A'}
                              </Box>
                              <Box as="td" textAlign="center">
                                {task.payout !== '--' && <Text color="whiteAlpha.800">{task.payout}</Text>}
                                {task.payout === '--' && '--'}
                              </Box>
                              <Box as="td" textAlign="center">
                                <HStack spacing={2} justify="center">
                                  {task.actions.includes('Upload Now') && (
                                    <Button 
                                      colorScheme="blue" 
                                      size="sm" 
                                      leftIcon={<FiUpload />}
                                      onClick={() => handleDirectFileUpload(task)}
                                    >
                                      Upload Now
                                    </Button>
                                  )}
                                  {task.actions.includes('Copy Link') && (
                                    <Tooltip label="Copy Link">
                                      <Button 
                                        colorScheme="gray" 
                                        size="sm" 
                                        leftIcon={<CopyIcon />}
                                        onClick={() => handleCopyLink(task.id)}
                                      >
                                        Copy Link
                                      </Button>
                                    </Tooltip>
                                  )}
                                  {task.actions.includes('View Details') && (
                                    <Button 
                                      colorScheme="gray" 
                                      size="sm" 
                                      leftIcon={<ViewIcon />}
                                    >
                                      View Details
                                    </Button>
                                  )}
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

                {/* Timeline Tab */}
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
                          {/* Timeline content would go here */}
                          <Text color="gray.400" textAlign="center" py={8}>
                            Timeline view coming soon...
                          </Text>
                        </VStack>
                      </Box>
                    </Box>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Box>
      </Box>

      {/* File Upload Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalBody p={6}>
            <VStack spacing={6}>
              <HStack>
                <Icon as={FiUploadCloud} color="purple.400" boxSize={6} />
                <Heading size="md" color="white">Upload File</Heading>
              </HStack>
              
              <Box
                w="full"
                h="200px"
                border="2px dashed"
                borderColor={dragActive ? "purple.400" : "gray.600"}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={dragActive ? "purple.50" : "gray.700"}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <VStack spacing={4}>
                  <Icon as={FiUploadCloud} color="purple.400" boxSize={8} />
                  <Text color="gray.300" textAlign="center">
                    Drag and drop your file here, or click to browse
                  </Text>
                </VStack>
              </Box>

              {isUploading && (
                <VStack spacing={4} w="full">
                  <CircularProgress value={uploadProgress} color="purple.400" size="60px">
                    <CircularProgressLabel>{uploadProgress}%</CircularProgressLabel>
                  </CircularProgress>
                  <Progress value={uploadProgress} w="full" colorScheme="purple" />
                  <Text color="gray.300">Uploading file...</Text>
                </VStack>
              )}

              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                display="none"
              />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Dashboard;