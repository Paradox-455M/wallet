import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Input,
  Link,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  CircularProgress,
  CircularProgressLabel,
  IconButton,
  Tooltip,
  Code,
  useClipboard,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, WarningIcon, CopyIcon, DownloadIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Navbar from './Navbar';
import StarryBackground from './StarryBackground';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const TransactionDetails = ({ transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
  const { currentUser } = useAuth();
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/transaction/${transactionId}` : '';
  const { onCopy, hasCopied } = useClipboard(shareUrl);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasCheckedRedirect = useRef(false);

  const copyTransactionLink = () => {
    onCopy();
    toast({
      title: 'Link copied',
      description: 'Transaction link copied to clipboard. Share it with the other party.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const fetchTransaction = async () => {
    try {
      setFetchError(null);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/transactions/${transactionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTransaction(data);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load transaction. You may need to sign in or the transaction may not exist.';
      setFetchError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTransaction();
    const interval = setInterval(fetchTransaction, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [transactionId]);

  // Handle Stripe redirect return (payment success/failure)
  useEffect(() => {
    if (hasCheckedRedirect.current || !transactionId) return;
    const redirectStatus = searchParams.get('redirect_status');
    if (!redirectStatus) return;
    hasCheckedRedirect.current = true;
    if (redirectStatus === 'succeeded') {
      fetchTransaction();
      setPaymentError(null);
      toast({
        title: 'Payment successful',
        description: 'Your payment has been received. Transaction will update shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSearchParams({}); // Clear URL params
    } else if (redirectStatus === 'failed' || redirectStatus === 'requires_payment_method') {
      setPaymentError(redirectStatus === 'failed' ? 'Payment failed. Please try again.' : 'Payment could not be completed. Please try a different payment method.');
      toast({
        title: 'Payment incomplete',
        description: redirectStatus === 'failed' ? 'Your payment failed. You can try again below.' : 'Please try again with a different payment method.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setSearchParams({}); // Clear URL params
    }
  }, [transactionId, searchParams, setSearchParams, toast]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transactions/${transactionId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      setUploadProgress(100);
      toast({
        title: 'Upload complete',
        description: `"${selectedFile.name}" uploaded successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchTransaction();
      setSelectedFile(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload file';
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const data = await fetchTransaction();
      const clientSecret = data?.client_secret;
      if (!clientSecret) {
        toast({
          title: 'Payment form loading',
          description: 'Refresh the page to load payment details, or try again in a moment.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        setProcessingPayment(false);
        return;
      }
      const stripe = await stripePromise;
      if (!stripe) {
        toast({
          title: 'Payment unavailable',
          description: 'Stripe could not be loaded. Check your connection.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setProcessingPayment(false);
        return;
      }
      toast({
        title: 'Payment ready',
        description: 'Complete payment in the Stripe-hosted flow when available, or refresh to load the payment form.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Payment failed';
      setPaymentError(msg);
      toast({
        title: 'Payment failed',
        description: msg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownload = async (fileType = 'seller') => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const url = fileType === 'buyer'
        ? `/api/transactions/${transactionId}/download?file=buyer`
        : `/api/transactions/${transactionId}/download`;
      const response = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const disposition = response.headers['content-disposition'];
      const match = disposition && disposition.match(/filename="?([^";]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : (fileType === 'buyer' ? 'buyer-requirements' : 'download');
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(a.href);
      toast({
        title: 'Download started',
        description: `"${filename}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchTransaction();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Download failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setDownloading(false);
    }
  };

  // Loading state: centered spinner
  if (loading && !transaction) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" p={6}>
        <VStack spacing={4}>
          <CircularProgress isIndeterminate size="48px" color="purple.400" />
          <Text color="gray.500" fontSize="sm">Loading transaction...</Text>
        </VStack>
      </Box>
    );
  }

  // Error state: message + retry
  if (fetchError && !transaction) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" p={6}>
        <VStack spacing={4} maxW="md" textAlign="center">
          <Alert status="error" borderRadius="lg" flexDirection="column" alignItems="center" gap={2}>
            <AlertIcon />
            <Text fontWeight="semibold">Could not load transaction</Text>
            <Text fontSize="sm">{fetchError}</Text>
          </Alert>
          <Button colorScheme="purple" onClick={() => { setLoading(true); setFetchError(null); fetchTransaction(); }}>
            Try again
          </Button>
          <Button as="a" href="/dashboard" variant="outline" colorScheme="gray">Back to Dashboard</Button>
        </VStack>
      </Box>
    );
  }

  if (!transaction) {
    return null;
  }

  // Get detailed transaction status
  const getTransactionStatus = () => {
    if (transaction.status === 'completed') {
      return {
        label: 'Completed',
        color: 'green.500',
        description: 'Transaction completed successfully. Funds have been released.',
        step: 4
      };
    }
    if (transaction.status === 'refunded') {
      return {
        label: 'Refunded',
        color: 'purple.500',
        description: 'This transaction has been refunded.',
        step: 0
      };
    }
    if (transaction.status === 'cancelled') {
      return {
        label: 'Cancelled',
        color: 'red.500',
        description: 'This transaction has been cancelled.',
        step: 0
      };
    }
    if (transaction.payment_received && transaction.file_uploaded) {
      return {
        label: 'Ready to Complete',
        color: 'blue.500',
        description: 'Payment received and file uploaded. Transaction will complete automatically.',
        step: 3
      };
    }
    if (transaction.payment_received && !transaction.file_uploaded) {
      return {
        label: 'Awaiting File Upload',
        color: 'orange.500',
        description: 'Payment received. Waiting for seller to upload the file.',
        step: 2
      };
    }
    if (!transaction.payment_received) {
      return {
        label: 'Awaiting Payment',
        color: 'yellow.500',
        description: 'Waiting for buyer to complete payment.',
        step: 1
      };
    }
    return {
      label: 'Pending',
      color: 'gray.500',
      description: 'Transaction is being processed.',
      step: 0
    };
  };

  const status = getTransactionStatus();
  const steps = [
    { label: 'Transaction Created', completed: true },
    { label: 'Payment Received', completed: transaction.payment_received },
    { label: 'File Uploaded', completed: transaction.file_uploaded },
    { label: 'Completed', completed: transaction.status === 'completed' }
  ];

  return (
    <Box minH="100vh" bg="gray.900" position="relative">
      <StarryBackground />
      <Navbar />
      <Box position="relative" zIndex={1} pt={24} pb={12} px={{ base: 4, md: 6 }}>
        <Box maxW="2xl" mx="auto">
          <Button
            as={RouterLink}
            to="/dashboard"
            variant="ghost"
            colorScheme="whiteAlpha"
            size="sm"
            mb={6}
            fontWeight="600"
            leftIcon={<ArrowForwardIcon transform="rotate(180deg)" />}
            _hover={{ bg: 'whiteAlpha.200' }}
            _focusVisible={{ boxShadow: '0 0 0 2px white, 0 0 0 4px rgba(147, 51, 234, 0.5)' }}
          >
            Back to Dashboard
          </Button>
          <Box
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="2xl"
            boxShadow="0 4px 24px rgba(0, 0, 0, 0.12)"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <VStack spacing={8} align="stretch">
              <Text fontSize="2xl" fontWeight="700" color="gray.800" letterSpacing="-0.02em" fontFamily="heading">
                Transaction Details
              </Text>

              {/* Status Badge */}
              <Box textAlign="center" py={2}>
          <Badge
            fontSize="lg"
            px={4}
            py={2}
            borderRadius="full"
            colorScheme={
              status.color === 'green.500' ? 'green' :
              status.color === 'orange.500' ? 'orange' :
              status.color === 'yellow.500' ? 'yellow' :
              status.color === 'red.500' ? 'red' :
              status.color === 'purple.500' ? 'purple' : 'gray'
            }
          >
            {status.label}
          </Badge>
          <Text mt={2} fontSize="sm" color="gray.600">
            {status.description}
          </Text>
        </Box>

        <Divider borderColor="gray.200" />

        {/* Progress Steps */}
        <Box>
          <Text fontWeight="600" fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
            Transaction Progress
          </Text>
          <VStack spacing={3} align="stretch">
            {steps.map((step, index) => (
              <HStack key={index} spacing={3}>
                {step.completed ? (
                  <CheckCircleIcon color="green.500" boxSize={5} />
                ) : status.step === index + 1 ? (
                  <CircularProgress isIndeterminate size="20px" color="blue.500" />
                ) : (
                  <TimeIcon color="gray.300" boxSize={5} />
                )}
                <Text
                  color={step.completed ? 'green.600' : status.step === index + 1 ? 'blue.600' : 'gray.400'}
                  fontWeight={step.completed || status.step === index + 1 ? 'bold' : 'normal'}
                >
                  {step.label}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        <Divider borderColor="gray.200" />

        {/* Transaction Info */}
        <Box>
          <Text fontWeight="700" fontSize="md" color="gray.800" mb={3}>
            Transaction Information
          </Text>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">Amount:</Text>
              <Text fontSize="lg" fontWeight="bold">${parseFloat(transaction.amount).toFixed(2)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">Item:</Text>
              <Text>{transaction.item_description}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">Buyer:</Text>
              <Text>{transaction.buyer_email}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">Seller:</Text>
              <Text>{transaction.seller_email}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">Payment Status:</Text>
              <Badge colorScheme={transaction.payment_received ? 'green' : 'yellow'}>
                {transaction.payment_received ? 'Received' : 'Pending'}
              </Badge>
            </HStack>
            <HStack justify="space-between">
              <Text fontWeight="semibold" color="gray.600">File Status:</Text>
              <Badge colorScheme={transaction.file_uploaded ? 'green' : 'orange'}>
                {transaction.file_uploaded ? 'Uploaded' : 'Pending'}
              </Badge>
            </HStack>
          </VStack>
        </Box>

        {/* Action Buttons Section */}
        <Box>
          <Text fontWeight="700" fontSize="md" color="gray.800" mb={3}>
            Actions
          </Text>
          <VStack spacing={3} align="stretch">
            {/* Payment status / error */}
            {paymentError && (
              <Alert status="error" borderRadius="md" flexDirection="column" alignItems="flex-start">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">Payment issue</Text>
                  <Text fontSize="sm">{paymentError}</Text>
                  <Button size="sm" mt={2} colorScheme="red" variant="outline" onClick={() => { setPaymentError(null); fetchTransaction(); }}>
                    Dismiss & refresh
                  </Button>
                </Box>
              </Alert>
            )}

            {/* Payment Button - Show for buyer if payment not received */}
            {currentUser?.email === transaction.buyer_email && !transaction.payment_received && transaction.status !== 'cancelled' && transaction.status !== 'refunded' && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Payment status: <Badge colorScheme="yellow">Pending</Badge> — Complete payment to continue.
                </Text>
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<ArrowForwardIcon />}
                  onClick={handlePayment}
                  isLoading={processingPayment}
                  loadingText="Opening payment..."
                  isDisabled={processingPayment}
                >
                  Pay ${parseFloat(transaction.amount).toFixed(2)} Now
                </Button>
                {!transaction.client_secret && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    If the button doesn&apos;t work, refresh the page to load payment details.
                  </Text>
                )}
              </Box>
            )}

            {/* Buyer Upload - Requirements / brief file (optional). Buyer can upload anytime. */}
            {currentUser?.email === transaction.buyer_email && 
             transaction.status !== 'cancelled' && 
             transaction.status !== 'refunded' && (
              <VStack spacing={3} align="stretch">
                <Alert status="info" borderRadius="md" variant="left-accent">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">Upload requirements or brief (optional)</Text>
                    <Text fontSize="sm">Share a file with the seller so they know what to deliver. Max 25MB. Images, PDF, ZIP, text.</Text>
                  </Box>
                </Alert>
                {transaction.buyer_file_uploaded && transaction.buyer_file_name && (
                  <HStack p={2} bg="green.50" borderRadius="md">
                    <CheckCircleIcon color="green.500" />
                    <Text fontSize="sm" fontWeight="medium">Uploaded: {transaction.buyer_file_name}</Text>
                  </HStack>
                )}
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.zip,.txt,.csv,application/json"
                  disabled={uploading}
                  size="sm"
                />
                {selectedFile && (
                  <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" noOfLines={1} title={selectedFile.name}>{selectedFile.name}</Text>
                    <Text fontSize="xs" color="gray.600">{formatFileSize(selectedFile.size)}</Text>
                  </HStack>
                )}
                {uploading && (
                  <Box w="full">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">Uploading...</Text>
                      <Text fontSize="sm" fontWeight="bold">{uploadProgress}%</Text>
                    </HStack>
                    <Progress value={uploadProgress} size="sm" colorScheme="purple" borderRadius="full" />
                  </Box>
                )}
                <Button
                  colorScheme="purple"
                  variant="outline"
                  size="md"
                  onClick={handleFileUpload}
                  isLoading={uploading}
                  loadingText="Uploading..."
                  disabled={!selectedFile || uploading}
                  leftIcon={<ArrowForwardIcon />}
                >
                  Upload requirements file
                </Button>
              </VStack>
            )}

            {/* Seller: Download buyer's requirements file */}
            {currentUser?.email === transaction.seller_email && 
             transaction.buyer_file_uploaded && 
             transaction.buyer_file_name && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">Buyer&apos;s requirements file</Text>
                <Button
                  size="md"
                  variant="outline"
                  colorScheme="teal"
                  leftIcon={<DownloadIcon />}
                  onClick={() => handleDownload('buyer')}
                  isLoading={downloading}
                  loadingText="Downloading..."
                >
                  Download &quot;{transaction.buyer_file_name}&quot;
                </Button>
              </Box>
            )}

            {/* File Upload - Show for seller if payment received but file not uploaded */}
            {currentUser?.email === transaction.seller_email && 
             transaction.payment_received && 
             !transaction.file_uploaded && (
              <VStack spacing={3} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">Upload File</Text>
                    <Text fontSize="sm">Payment has been received. Please upload the file for the buyer. Max size: 25MB. Allowed: images, PDF, ZIP, text.</Text>
                  </Box>
                </Alert>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.zip,.txt,.csv,application/json"
                  disabled={uploading}
                  size="lg"
                />
                {selectedFile && (
                  <HStack justify="space-between" w="full" p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" noOfLines={1} title={selectedFile.name}>
                      {selectedFile.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </HStack>
                )}
                {uploading && (
                  <Box w="full">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm">Uploading...</Text>
                      <Text fontSize="sm" fontWeight="bold">{uploadProgress}%</Text>
                    </HStack>
                    <Progress value={uploadProgress} size="sm" colorScheme="blue" borderRadius="full" />
                  </Box>
                )}
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleFileUpload}
                  isLoading={uploading}
                  loadingText="Uploading..."
                  disabled={!selectedFile || uploading}
                  leftIcon={<ArrowForwardIcon />}
                >
                  Upload File
                </Button>
              </VStack>
            )}

            {/* Download - Show for buyer if file uploaded */}
            {currentUser?.email === transaction.buyer_email && 
             transaction.file_uploaded && 
             transaction.payment_received && (
              <Box>
                {transaction.file_name && (
                  <HStack mb={2} p={2} bg="gray.50" borderRadius="md">
                    <DownloadIcon color="green.500" />
                    <Text fontSize="sm" fontWeight="medium">{transaction.file_name}</Text>
                  </HStack>
                )}
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  isLoading={downloading}
                  loadingText="Downloading..."
                >
                  Download File
                </Button>
              </Box>
            )}

            {/* Share Transaction Link */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Share this link with the buyer or seller to give them access to this transaction.
              </Text>
              <HStack spacing={2}>
                <Code flex={1} p={2} borderRadius="md" fontSize="sm" noOfLines={1} title={shareUrl}>
                  {shareUrl}
                </Code>
                <Tooltip label={hasCopied ? 'Copied!' : 'Copy link'}>
                  <Button
                    leftIcon={<CopyIcon />}
                    onClick={copyTransactionLink}
                    aria-label="Copy transaction link"
                    colorScheme={hasCopied ? 'green' : 'purple'}
                    size="sm"
                  >
                    {hasCopied ? 'Copied!' : 'Copy link'}
                  </Button>
                </Tooltip>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Status Alerts */}
        {!transaction.payment_received && currentUser?.email === transaction.buyer_email && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Payment Required</Text>
              <Text fontSize="sm">Complete the payment to proceed with this transaction. Your funds will be held securely until the seller uploads the file.</Text>
            </Box>
          </Alert>
        )}

        {transaction.payment_received && !transaction.file_uploaded && currentUser?.email === transaction.seller_email && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Payment Received</Text>
              <Text fontSize="sm">The buyer has completed payment. Please upload the file to complete the transaction.</Text>
            </Box>
          </Alert>
        )}

        {transaction.status === 'completed' && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Transaction Completed</Text>
              <Text fontSize="sm">This transaction has been completed successfully. Funds have been released to the seller.</Text>
            </Box>
          </Alert>
        )}

        {transaction.status === 'refunded' && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Refunded</Text>
              <Text fontSize="sm">This transaction has been refunded.</Text>
            </Box>
          </Alert>
        )}

        <HStack spacing={4} justify="center">
          <Box textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Created
            </Text>
            <Text fontSize="sm">
              {new Date(transaction.created_at).toLocaleDateString()}
            </Text>
          </Box>
          {transaction.completed_at && (
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">
                Completed
              </Text>
              <Text fontSize="sm">
                {new Date(transaction.completed_at).toLocaleDateString()}
              </Text>
            </Box>
          )}
        </HStack>
      </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TransactionDetails;