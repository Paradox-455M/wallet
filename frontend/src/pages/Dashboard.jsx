import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, VStack, Heading, Text, Avatar, Modal, ModalOverlay, ModalContent, ModalBody, 
  useDisclosure, HStack, Flex, Badge, Icon, Button, Tabs, TabList, TabPanels, Tab, 
  TabPanel, Divider, Tooltip, useToast, Progress, Input, Select, InputGroup, InputLeftElement,
  CircularProgress, CircularProgressLabel, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, Alert, AlertIcon, Spinner, Menu, MenuButton, MenuList, MenuItem, IconButton,
  Skeleton
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, TimeIcon, ArrowForwardIcon, ViewIcon, DownloadIcon, CopyIcon, 
  CloseIcon, AttachmentIcon, ArrowUpIcon, SearchIcon, ChevronDownIcon, BellIcon, RepeatIcon
} from '@chakra-ui/icons';
import { FiUpload, FiUploadCloud, FiTrendingUp, FiDollarSign, FiUsers, FiActivity } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';
import Onboarding from '../components/Onboarding';
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
    },
    REFUNDED: {
      bg: 'linear-gradient(135deg, #9F7AEA 0%, #805AD5 100%)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(159, 122, 234, 0.3)'
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
  const { isAuthenticated, currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef(null);
  const [buyerData, setBuyerData] = useState([]);
  const [sellerData, setSellerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({
    totalTransactions: 0,
    totalEarnings: 0,
    activeTransactions: 0,
    monthlyGrowth: 0
  });
  const toast = useToast();

  // Real-time updates simulation
  useEffect(() => {
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        // Simulate real-time updates
        setBuyerData(prev => {
          if (Array.isArray(prev)) {
            return prev.map(item => ({
              ...item,
              lastUpdated: new Date().toISOString()
            }));
          }
          // If prev is an object with transactions property, update the transactions
          if (prev && prev.transactions && Array.isArray(prev.transactions)) {
            return {
              ...prev,
              transactions: prev.transactions.map(item => ({
                ...item,
                lastUpdated: new Date().toISOString()
              }))
            };
          }
          return prev;
        });
        setSellerData(prev => {
          if (Array.isArray(prev)) {
            return prev.map(item => ({
              ...item,
              lastUpdated: new Date().toISOString()
            }));
          }
          // If prev is an object with transactions property, update the transactions
          if (prev && prev.transactions && Array.isArray(prev.transactions)) {
            return {
              ...prev,
              transactions: prev.transactions.map(item => ({
                ...item,
                lastUpdated: new Date().toISOString()
              }))
            };
          }
          return prev;
        });
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  // Enhanced analytics calculation
  useEffect(() => {
    // Handle both array and object formats for buyerData and sellerData
    const getTransactionsFromData = (data) => {
      if (Array.isArray(data)) {
        return data;
      }
      if (data && data.transactions && Array.isArray(data.transactions)) {
        return data.transactions;
      }
      return [];
    };
    
    const buyerTransactions = getTransactionsFromData(buyerData);
    const sellerTransactions = getTransactionsFromData(sellerData);
    
    const allTransactions = [...buyerTransactions, ...sellerTransactions];
    const totalAmount = allTransactions.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const activeCount = allTransactions.filter(item => 
      item.status === 'AWAITING FILE' || item.status === 'AWAITING PAYMENT'
    ).length;

    setAnalyticsData({
      totalTransactions: allTransactions.length,
      totalEarnings: totalAmount,
      activeTransactions: activeCount,
      monthlyGrowth: Math.floor(Math.random() * 20) + 5 // Simulated growth
    });
  }, [buyerData, sellerData]);

  // Fetch buyer data (optional search & status filter)
  const fetchBuyerData = React.useCallback(async (opts = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (opts.search != null && String(opts.search).trim()) params.search = String(opts.search).trim();
      if (opts.status != null && opts.status !== 'ALL') params.status = opts.status;
      const response = await axios.get('/api/transactions/buyer-data', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
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
  }, [toast]);

  // Fetch seller data (optional search & status filter)
  const fetchSellerData = React.useCallback(async (opts = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (opts.search != null && String(opts.search).trim()) params.search = String(opts.search).trim();
      if (opts.status != null && opts.status !== 'ALL') params.status = opts.status;
      const response = await axios.get('/api/transactions/seller-data', {
        headers: { Authorization: `Bearer ${token}` },
        params,
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
  }, [toast]);

  // Debounce search term (400ms) to avoid refetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Load data on mount and when debounced search / status filter changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBuyerData({ search: debouncedSearch, status: statusFilter }),
          fetchSellerData({ search: debouncedSearch, status: statusFilter }),
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [debouncedSearch, statusFilter, fetchBuyerData, fetchSellerData]);

  // Helper functions for buyer view
  const getBuyerStats = () => {
    // Handle both array and object formats
    const stats = (buyerData && buyerData.statistics) ? buyerData.statistics : {};
    return [
      { title: 'Total Transactions', value: stats.totalTransactions || 0, icon: '📊' },
      { title: 'Pending Files', value: stats.pendingFiles || 0, icon: '⏳' },
      { title: 'Completed', value: stats.completedTransactions || 0, icon: '✅' },
      { title: 'Total Spent', value: `$${(stats.totalSpent || 0).toFixed(2)}`, icon: '💰' }
    ];
  };

  const getBuyerTransactions = () => {
    // Helper function to get transactions from data
    const getTransactionsFromData = (data) => {
      if (Array.isArray(data)) {
        return data;
      }
      if (data && data.transactions && Array.isArray(data.transactions)) {
        return data.transactions;
      }
      return [];
    };

    return getTransactionsFromData(buyerData).map(transaction => ({
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
    // Handle both array and object formats
    const stats = (sellerData && sellerData.statistics) ? sellerData.statistics : {};
    return [
      { title: '# of Uploads', value: stats.totalUploads || 0, icon: '🗂️' },
      { title: 'Total Earned', value: `$${(stats.totalEarned || 0).toFixed(2)}`, icon: '💰' },
      { title: 'Pending Payouts', value: `$${(stats.pendingPayouts || 0).toFixed(2)}`, icon: '⏳' },
      { title: 'Downloads Completed', value: stats.downloadsCompleted || 0, icon: '📩' }
    ];
  };

  const getSellerTransactions = () => {
    // Helper function to get transactions from data
    const getTransactionsFromData = (data) => {
      if (Array.isArray(data)) {
        return data;
      }
      if (data && data.transactions && Array.isArray(data.transactions)) {
        return data.transactions;
      }
      return [];
    };

    return getTransactionsFromData(sellerData).map(transaction => ({
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

  // Helper function for Transaction History - combines buyer and seller transactions
  const getAllTransactions = () => {
    // Helper function to get transactions from data
    const getTransactionsFromData = (data) => {
      if (Array.isArray(data)) {
        return data;
      }
      if (data && data.transactions && Array.isArray(data.transactions)) {
        return data.transactions;
      }
      return [];
    };

    const buyerTransactions = getTransactionsFromData(buyerData).map(transaction => ({
      id: transaction.id,
      item: transaction.item_description,
      type: 'BUY',
      counterparty: transaction.seller_email,
      amount: parseFloat(transaction.amount),
      status: getTransactionStatus(transaction),
      date: new Date(transaction.created_at).toLocaleDateString(),
      time: new Date(transaction.created_at).toLocaleTimeString(),
      actions: getTransactionActions(transaction),
      createdAt: new Date(transaction.created_at)
    }));

    const sellerTransactions = getTransactionsFromData(sellerData).map(transaction => ({
      id: transaction.id,
      item: transaction.item_description,
      type: 'SELL',
      counterparty: transaction.buyer_email,
      amount: parseFloat(transaction.amount),
      status: getTransactionStatus(transaction),
      date: new Date(transaction.created_at).toLocaleDateString(),
      time: new Date(transaction.created_at).toLocaleTimeString(),
      actions: getTransactionActions(transaction),
      createdAt: new Date(transaction.created_at)
    }));

    // Combine and sort by creation date (newest first)
    const allTransactions = [...buyerTransactions, ...sellerTransactions];
    return allTransactions.sort((a, b) => b.createdAt - a.createdAt);
  };

  // Helper functions for transaction processing
  const getTransactionStatus = (transaction) => {
    if (transaction.status === 'completed') return 'COMPLETE';
    if (transaction.status === 'refunded') return 'REFUNDED';
    if (transaction.payment_received && !transaction.file_uploaded) return 'AWAITING FILE';
    if (!transaction.payment_received) return 'AWAITING PAYMENT';
    if (transaction.status === 'cancelled') return 'CANCELLED';
    return 'PENDING';
  };

  const getPayoutStatus = (transaction) => {
    if (transaction.status === 'completed') return `Paid ($${transaction.amount})`;
    if (transaction.status === 'cancelled' || transaction.status === 'refunded') return `Refunded (-$${transaction.amount})`;
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

    setUploading(true);
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
      setUploading(false);
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

  // Export uses current lists (already filtered by API search/status)

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isThisWeek = (date) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  };

  const isThisMonth = (date) => {
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  // Export functionality (uses current filtered list)
  const exportTransactions = (data, type) => {
    const row = (item) => [
      item.id,
      item.title || item.item,
      item.amount,
      item.status,
      item.createdAt || item.date || item.details?.created || ''
    ].join(',');
    const csvContent = data.map(row).join('\n');
    const blob = new Blob([`ID,Title,Amount,Status,Date\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({
      title: 'Export Successful',
      description: `${type} transactions exported successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  // Enhanced analytics cards
  const AnalyticsCard = ({ title, value, icon, change, color }) => (
    <Box
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
      backdropFilter="blur(20px)"
      borderRadius="2xl"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      border="1px solid"
      borderColor="whiteAlpha.300"
      p={6}
      _hover={{
        transform: 'translateY(-4px) scale(1.02)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        borderColor: color
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
        bg={`linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`}
      />
      <HStack spacing={4} align="center">
        <Icon as={icon} w={8} h={8} color={color} />
        <VStack align="start" spacing={1}>
          <Text color="gray.400" fontSize="sm" fontWeight="medium">{title}</Text>
          <Text color="white" fontSize="2xl" fontWeight="bold">{value}</Text>
          {change && (
            <HStack spacing={1}>
              <Stat>
                <StatArrow type={change > 0 ? 'increase' : 'decrease'} color={change > 0 ? 'green.400' : 'red.400'} />
              </Stat>
              <Text color={change > 0 ? 'green.400' : 'red.400'} fontSize="sm">{Math.abs(change)}%</Text>
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  );

  // Enhanced filter controls
  const FilterControls = () => (
    <Box
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
      backdropFilter="blur(20px)"
      borderRadius="xl"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={{ base: 4, md: 6 }}
      mb={6}
    >
      <HStack spacing={4} justify="space-between" flexWrap="wrap" gap={3}>
        <HStack spacing={4} flex={1} minW={{ base: "100%", md: "auto" }}>
          <InputGroup maxW={{ base: "100%", md: "300px" }} flex={1}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="purple.300" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              borderColor="whiteAlpha.200"
              color="white"
              _placeholder={{ color: 'purple.200' }}
            />
          </InputGroup>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg="rgba(255, 255, 255, 0.1)"
            borderColor="whiteAlpha.200"
            color="white"
            maxW="200px"
          >
            <option value="ALL" style={{ backgroundColor: '#1a202c', color: 'white' }}>All Status</option>
            <option value="COMPLETE" style={{ backgroundColor: '#1a202c', color: 'white' }}>Complete</option>
            <option value="AWAITING FILE" style={{ backgroundColor: '#1a202c', color: 'white' }}>Awaiting File</option>
            <option value="AWAITING PAYMENT" style={{ backgroundColor: '#1a202c', color: 'white' }}>Awaiting Payment</option>
            <option value="CANCELLED" style={{ backgroundColor: '#1a202c', color: 'white' }}>Cancelled</option>
            <option value="REFUNDED" style={{ backgroundColor: '#1a202c', color: 'white' }}>Refunded</option>
          </Select>
          
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            bg="rgba(255, 255, 255, 0.1)"
            borderColor="whiteAlpha.200"
            color="white"
            maxW="150px"
          >
            <option value="ALL" style={{ backgroundColor: '#1a202c', color: 'white' }}>All Time</option>
            <option value="TODAY" style={{ backgroundColor: '#1a202c', color: 'white' }}>Today</option>
            <option value="WEEK" style={{ backgroundColor: '#1a202c', color: 'white' }}>This Week</option>
            <option value="MONTH" style={{ backgroundColor: '#1a202c', color: 'white' }}>This Month</option>
          </Select>
        </HStack>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<RepeatIcon />}
            onClick={() => {
              setLoading(true);
              Promise.all([
                fetchBuyerData({ search: debouncedSearch, status: statusFilter }),
                fetchSellerData({ search: debouncedSearch, status: statusFilter }),
              ]).finally(() => setLoading(false));
            }}
            bg="linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)"
            color="white"
            _hover={{
              bg: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)'
            }}
            size="sm"
          >
            Refresh
          </Button>
          
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              bg="linear-gradient(135deg, #9333EA 0%, #4F46E5 100%)"
              color="white"
              _hover={{
                bg: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(147, 51, 234, 0.4)'
              }}
              size="sm"
            >
              Export
            </MenuButton>
                      <MenuList bg="gray.800" borderColor="whiteAlpha.200">
            <MenuItem 
              onClick={() => exportTransactions(getBuyerTransactions(), 'Buyer')}
              _hover={{ bg: 'whiteAlpha.100' }}
              color="white"
            >
              Export Buyer Data
            </MenuItem>
            <MenuItem 
              onClick={() => exportTransactions(getSellerTransactions(), 'Seller')}
              _hover={{ bg: 'whiteAlpha.100' }}
              color="white"
            >
              Export Seller Data
            </MenuItem>
            <MenuItem 
              onClick={() => exportTransactions(getAllTransactions(), 'Complete History')}
              _hover={{ bg: 'whiteAlpha.100' }}
              color="white"
            >
              Export Complete History
            </MenuItem>
          </MenuList>
          </Menu>
        </HStack>
      </HStack>
    </Box>
  );

  if (!currentUser || !isAuthenticated) {
    return <Login />;
  }

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden">
      <StarryBackground />
      <Navbar onLoginOpen={onOpen} />
      <Onboarding />
      <Box position="relative" zIndex={1}>
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }} pt={{ base: 24, md: 28 }}>
          <VStack spacing={8} align="stretch">
            {/* Enhanced Header with Real-time Indicator */}
            <Box>
              <HStack justify="space-between" align="center" mb={4}>
                <VStack align="start" spacing={2}>
                <Heading 
                size="2xl" 
                color="white" 
                mb={3}
                bgGradient="linear(to-r, purple.300, blue.300)"
                bgClip="text"
                fontWeight="bold"
                style={{marginTop: '5%'}}
              >
                Dashboard
              </Heading>
                  <Heading size="xl" color="white" fontWeight="bold" >
                    Welcome back, {currentUser?.email}
                  </Heading>
                  <HStack spacing={2}>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={realTimeUpdates ? 'green.400' : 'gray.400'}
                      boxShadow={realTimeUpdates ? '0 0 10px rgba(72, 187, 120, 0.5)' : 'none'}
                    />
                    <Text color="gray.400" fontSize="sm">
                      {realTimeUpdates ? 'Live Updates Active' : 'Updates Paused'}
                    </Text>
                  </HStack>
                </VStack>
                <Button
                  leftIcon={<BellIcon />}
                  onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                  bg={realTimeUpdates ? 'green.500' : 'gray.600'}
                  color="white"
                  _hover={{
                    bg: realTimeUpdates ? 'green.600' : 'gray.500'
                  }}
                  size="sm"
                >
                  {realTimeUpdates ? 'Live' : 'Paused'}
                </Button>
              </HStack>
            </Box>

            {/* Analytics Cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <AnalyticsCard
                title="Total Transactions"
                value={analyticsData.totalTransactions}
                icon={FiActivity}
                change={analyticsData.monthlyGrowth}
                color="purple.300"
              />
              <AnalyticsCard
                title="Total Earnings"
                value={`$${analyticsData.totalEarnings.toLocaleString()}`}
                icon={FiDollarSign}
                change={12}
                color="green.300"
              />
              <AnalyticsCard
                title="Active Transactions"
                value={analyticsData.activeTransactions}
                icon={FiTrendingUp}
                change={8}
                color="blue.300"
              />
              <AnalyticsCard
                title="Monthly Growth"
                value={`${analyticsData.monthlyGrowth}%`}
                icon={FiUsers}
                change={analyticsData.monthlyGrowth}
                color="orange.300"
              />
            </SimpleGrid>

            {/* Enhanced Tabs with Filter Controls */}
            <Tabs variant="soft-rounded" colorScheme="purple" isFitted onChange={setActiveTab}>
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
                  Buyer Transactions
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
                  Seller Transactions
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
                  Transaction History
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <FilterControls />
                  {/* Enhanced Buyer Transactions Table */}
                  <Box
                    position="relative"
                    bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
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
                            [...Array(4)].map((_, i) => (
                              <Box as="tr" key={`sk-buyer-${i}`}>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="24" borderRadius="full" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="16" ml="auto" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="6" width="24" borderRadius="full" mx="auto" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="20" mx="auto" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <HStack justify="center" spacing={2}>
                                    <Skeleton height="8" width="20" borderRadius="lg" bg="whiteAlpha.200" />
                                    <Skeleton height="8" width="20" borderRadius="lg" bg="whiteAlpha.200" />
                                  </HStack>
                                </Box>
                              </Box>
                            ))
                          ) : getBuyerTransactions().length === 0 ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={12}>
                                <VStack spacing={4}>
                                  <Icon as={FiActivity} color="gray.500" boxSize={10} />
                                  <Text color="gray.400" fontWeight="medium">No buyer transactions yet</Text>
                                  <Text color="gray.500" fontSize="sm">Create a transaction to get started.</Text>
                                  <Button 
                                    colorScheme="purple" 
                                    size="md"
                                    onClick={() => window.location.href = '/create-transaction'}
                                    _focusVisible={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)' }}
                                  >
                                    Create your first transaction
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
                                  {tx.status === 'REFUNDED' && <Text fontSize="xs" color="purple.300">Refunded</Text>}
                                </VStack>
                              </Box>
                              <Box as="td" textAlign="center">
                                <HStack spacing={2} justify="center">
                                  {tx.actions.includes('Pay Now') && (
                                    <Button 
                                      bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
                                      color="white"
                                      size="sm"
                                      onClick={() => window.location.href = `/transaction/${tx.id}`}
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
                                  {tx.actions.includes('View Details') && (
                                    <Button 
                                      colorScheme="gray" 
                                      size="sm" 
                                      leftIcon={<ViewIcon />}
                                      onClick={() => window.location.href = `/transaction/${tx.id}`}
                                    >
                                      View Details
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
                  <FilterControls />
                  {/* Enhanced Seller Transactions Table */}
                  <Box
                    position="relative"
                    bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
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
                      Upload Tasks
                    </Heading>
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
                            [...Array(4)].map((_, i) => (
                              <Box as="tr" key={`sk-seller-${i}`}>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="28" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="6" width="24" borderRadius="full" mx="auto" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="16" mx="auto" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <Skeleton height="4" width="20" mx="auto" borderRadius="md" bg="whiteAlpha.200" />
                                </Box>
                                <Box as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                  <HStack justify="center"><Skeleton height="8" width="24" borderRadius="lg" bg="whiteAlpha.200" /></HStack>
                                </Box>
                              </Box>
                            ))
                          ) : getSellerTransactions().length === 0 ? (
                            <Box as="tr">
                              <Box as="td" colSpan={6} textAlign="center" py={12}>
                                <VStack spacing={4}>
                                  <Icon as={FiUpload} color="gray.500" boxSize={10} />
                                  <Text color="gray.400" fontWeight="medium">No seller tasks yet</Text>
                                  <Text color="gray.500" fontSize="sm">Transactions will appear here when buyers pay you.</Text>
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
                                      onClick={() => window.location.href = `/transaction/${task.id}`}
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

                <TabPanel px={0}>
                  <FilterControls />
                  {/* Enhanced Transaction History Table */}
                  <Box
                    position="relative"
                    bg="linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                    backdropFilter="blur(20px)"
                    borderRadius="3xl"
                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
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
                      Complete Transaction History
                    </Heading>
                    <Box overflowX="auto">
                      <Box as="table" w="full" sx={{ borderSpacing: 0 }}>
                        <Box as="thead">
                          <Box as="tr">
                            <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Transaction ID</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Item</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Type</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="left" color="whiteAlpha.700">Counterparty</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="right" color="whiteAlpha.700">Amount</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Status</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Date</Box>
                            <Box as="th" {...transactionTableHeader} textAlign="center" color="whiteAlpha.700">Actions</Box>
                          </Box>
                        </Box>
                        <Box as="tbody">
                          {loading ? (
                            [...Array(3)].map((_, i) => (
                              <Box as="tr" key={`sk-history-${i}`}>
                                {[...Array(8)].map((_, j) => (
                                  <Box key={j} as="td" px={6} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                                    <Skeleton height="4" width={j === 1 ? '32' : '20'} borderRadius="md" bg="whiteAlpha.200" />
                                  </Box>
                                ))}
                              </Box>
                            ))
                          ) : getAllTransactions().length === 0 ? (
                            <Box as="tr">
                              <Box as="td" colSpan={8} textAlign="center" py={12}>
                                <VStack spacing={4}>
                                  <Icon as={FiActivity} color="gray.500" boxSize={10} />
                                  <Text color="gray.400" fontWeight="medium">No history yet</Text>
                                  <Text color="gray.500" fontSize="sm">Your transaction history will appear here.</Text>
                                </VStack>
                              </Box>
                            </Box>
                          ) : getAllTransactions().map((tx, idx) => (
                            <Box as="tr" key={tx.id || idx} {...transactionTableRow}>
                              <Box as="td" textAlign="left">
                                <Text fontSize="sm" color="purple.300" fontWeight="bold">#{tx.id}</Text>
                              </Box>
                              <Box as="td" textAlign="left" fontWeight="bold">{tx.item}</Box>
                              <Box as="td" textAlign="left">
                                <Badge
                                  bg={tx.type === 'BUY' ? 'blue.500' : 'green.500'}
                                  color="white"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                  borderRadius="full"
                                >
                                  {tx.type}
                                </Badge>
                              </Box>
                              <Box as="td" textAlign="left">
                                <HStack>
                                  <Avatar size="xs" name={tx.counterparty} bg="whiteAlpha.600" color="purple.700" />
                                  <Text color="whiteAlpha.800">{tx.counterparty}</Text>
                                </HStack>
                              </Box>
                              <Box as="td" textAlign="right">
                                <Text color={tx.type === 'BUY' ? 'red.300' : 'green.300'} fontWeight="bold">
                                  {tx.type === 'BUY' ? '-' : '+'}${tx.amount.toFixed(2)}
                                </Text>
                              </Box>
                              <Box as="td" textAlign="center">{statusBadge(tx.status)}</Box>
                              <Box as="td" textAlign="center">
                                <VStack spacing={1} align="center">
                                  <Text fontSize="xs" color="gray.300">{tx.date}</Text>
                                  <Text fontSize="xs" color="gray.400">{tx.time}</Text>
                                </VStack>
                              </Box>
                              <Box as="td" textAlign="center">
                                <HStack spacing={2} justify="center">
                                  {tx.actions.includes('Download File') && (
                                    <Button 
                                      colorScheme="purple" 
                                      size="sm" 
                                      leftIcon={<DownloadIcon />}
                                      onClick={() => handleDownloadFile(tx.id)}
                                    >
                                      Download
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
                                      onClick={() => window.location.href = `/transaction/${tx.id}`}
                                    >
                                      Details
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

              {uploading && (
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