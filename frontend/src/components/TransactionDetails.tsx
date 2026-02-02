import { useState, useEffect, useRef, useMemo, type ChangeEvent } from 'react';
import type { AxiosProgressEvent } from 'axios';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Progress,
  useToast,
  Input,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  Code,
  useClipboard,
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon, CopyIcon, DownloadIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { Elements, ElementsConsumer, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import Navbar from './Navbar';
import StarryBackground from './StarryBackground';
import type { ApiTransaction } from '../types/transactions';
import { downloadTransactionFile, getTransaction, uploadTransactionFile } from '../api/transactions';

type TransactionDetailsProps = {
  transactionId: string;
};

type TransactionDetailsData = ApiTransaction & {
  client_secret?: string | null;
};

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const TransactionDetails = ({ transactionId }: TransactionDetailsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
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

  const transactionQuery = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => getTransaction(transactionId),
    enabled: Boolean(transactionId),
    refetchInterval: 10000,
  });

  const transaction = transactionQuery.data ?? null;
  const loading = transactionQuery.isLoading;

  const uploadMutation = useMutation({
    mutationFn: (args: { id: string; file: File; onUploadProgress?: (event: AxiosProgressEvent) => void }) =>
      uploadTransactionFile(args.id, args.file, args.onUploadProgress),
    onSuccess: () => {
      transactionQuery.refetch();
    },
  });

  const fetchError = useMemo(() => {
    if (!transactionQuery.error) return null;
    return (
      (transactionQuery.error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      (transactionQuery.error as Error).message ||
      'Failed to load transaction. You may need to sign in or the transaction may not exist.'
    );
  }, [transactionQuery.error]);

  useEffect(() => {
    if (!fetchError) return;
    toast({
      title: 'Error',
      description: fetchError,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [fetchError, toast]);

  useEffect(() => {
    if (hasCheckedRedirect.current || !transactionId) return;
    const redirectStatus = searchParams.get('redirect_status');
    if (!redirectStatus) return;
    hasCheckedRedirect.current = true;
    if (redirectStatus === 'succeeded') {
      transactionQuery.refetch();
      setPaymentError(null);
      toast({
        title: 'Payment successful',
        description: 'Your payment has been received. Transaction will update shortly.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSearchParams({});
    } else if (redirectStatus === 'failed' || redirectStatus === 'requires_payment_method') {
      setPaymentError(
        redirectStatus === 'failed'
          ? 'Payment failed. Please try again.'
          : 'Payment could not be completed. Please try a different payment method.'
      );
      toast({
        title: 'Payment incomplete',
        description:
          redirectStatus === 'failed'
            ? 'Your payment failed. You can try again below.'
            : 'Please try again with a different payment method.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setSearchParams({});
    }
  }, [transactionId, searchParams, setSearchParams, toast, transactionQuery]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
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
      await uploadMutation.mutateAsync({
        id: transactionId,
        file: selectedFile,
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

      transactionQuery.refetch();
      setSelectedFile(null);
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (error as Error).message ||
        'Failed to upload file';
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePayment = async (stripe: Stripe | null, elements: StripeElements | null) => {
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      if (!stripePromise) {
        const message = 'Stripe public key is missing. Set VITE_STRIPE_PUBLIC_KEY to continue.';
        setPaymentError(message);
        toast({ title: 'Payment unavailable', description: message, status: 'error', duration: 5000, isClosable: true });
        return;
      }

      if (!stripe || !elements) {
        const message = 'Stripe could not be initialized. Please refresh and try again.';
        setPaymentError(message);
        toast({ title: 'Payment unavailable', description: message, status: 'error', duration: 5000, isClosable: true });
        return;
      }

      const result = await transactionQuery.refetch();
      const clientSecret = result.data?.client_secret;
      if (!clientSecret) {
        toast({
          title: 'Payment form loading',
          description: 'Refresh the page to load payment details, or try again in a moment.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const confirmation = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (confirmation.error) {
        const message = confirmation.error.message || 'Payment failed. Please try again.';
        setPaymentError(message);
        toast({ title: 'Payment failed', description: message, status: 'error', duration: 5000, isClosable: true });
        return;
      }

      if (confirmation.paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Payment successful',
          description: 'Your payment has been received. Transaction will update shortly.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        transactionQuery.refetch();
      } else {
        toast({
          title: 'Payment processing',
          description: 'Your payment is being processed. We will update the transaction status shortly.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Payment failed';
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

  const handleDownload = async (fileType: 'buyer' | 'seller' = 'seller') => {
    setDownloading(true);
    try {
      const response = await downloadTransactionFile(transactionId, fileType);
      const blob = new Blob([response.data]);
      const disposition = response.headers['content-disposition'];
      const match = disposition && disposition.match(/filename="?([^";]+)"?/);
      const filename = match ? decodeURIComponent(match[1]) : fileType === 'buyer' ? 'buyer-requirements' : 'download';
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      toast({
        title: 'Download started',
        description: `"${filename}"`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      transactionQuery.refetch();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Download failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !transaction) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" p={6}>
        <VStack spacing={4}>
          <CircularProgress isIndeterminate size="48px" color="purple.400" />
          <Text color="gray.500" fontSize="sm">
            Loading transaction...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (fetchError && !transaction) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center" p={6}>
        <VStack spacing={4} maxW="md" textAlign="center">
          <Alert status="error" borderRadius="lg" flexDirection="column" alignItems="center" gap={2}>
            <AlertIcon />
            <Text fontWeight="semibold">Could not load transaction</Text>
            <Text fontSize="sm">{fetchError}</Text>
          </Alert>
          <Button colorScheme="purple" onClick={() => transactionQuery.refetch()}>
            Try again
          </Button>
          <Button as="a" href="/dashboard" variant="outline" colorScheme="gray">
            Back to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!transaction) {
    return null;
  }

  const getTransactionStatus = () => {
    if (transaction.status === 'completed') {
      return {
        label: 'Completed',
        color: 'green.500',
        description: 'Transaction completed successfully. Funds have been released.',
        step: 4,
      };
    }
    if (transaction.status === 'refunded') {
      return {
        label: 'Refunded',
        color: 'purple.500',
        description: 'This transaction has been refunded.',
        step: 0,
      };
    }
    if (transaction.status === 'cancelled') {
      return {
        label: 'Cancelled',
        color: 'red.500',
        description: 'This transaction has been cancelled.',
        step: 0,
      };
    }
    if (transaction.payment_received && transaction.file_uploaded) {
      return {
        label: 'Ready to Complete',
        color: 'blue.500',
        description: 'Payment received and file uploaded. Transaction will complete automatically.',
        step: 3,
      };
    }
    if (transaction.payment_received && !transaction.file_uploaded) {
      return {
        label: 'Awaiting File Upload',
        color: 'orange.500',
        description: 'Payment received. Waiting for seller to upload the file.',
        step: 2,
      };
    }
    if (!transaction.payment_received) {
      return {
        label: 'Awaiting Payment',
        color: 'yellow.500',
        description: 'Waiting for buyer to complete payment.',
        step: 1,
      };
    }
    return {
      label: 'Pending',
      color: 'gray.500',
      description: 'Transaction is being processed.',
      step: 0,
    };
  };

  const status = getTransactionStatus();
  const steps = [
    { label: 'Transaction Created', completed: true },
    { label: 'Payment Received', completed: Boolean(transaction.payment_received) },
    { label: 'File Uploaded', completed: Boolean(transaction.file_uploaded) },
    { label: 'Completed', completed: transaction.status === 'completed' },
  ];

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden" w="100%">
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
            <VStack spacing={8} align="stretch" textAlign="left">
              <Text fontSize="2xl" fontWeight="700" color="gray.800" letterSpacing="-0.02em" fontFamily="heading">
                Transaction Details
              </Text>

              <Box textAlign="center" py={2}>
                <Badge
                  fontSize="lg"
                  px={4}
                  py={2}
                  borderRadius="full"
                  colorScheme={
                    status.color === 'green.500'
                      ? 'green'
                      : status.color === 'orange.500'
                      ? 'orange'
                      : status.color === 'yellow.500'
                      ? 'yellow'
                      : status.color === 'red.500'
                      ? 'red'
                      : status.color === 'purple.500'
                      ? 'purple'
                      : 'gray'
                  }
                >
                  {status.label}
                </Badge>
                <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                  {status.description}
                </Text>
              </Box>

              <Divider borderColor="gray.200" />

              <Box>
                <Text fontWeight="600" fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={4}>
                  Transaction Progress
                </Text>
                <VStack spacing={3} align="stretch">
                  {steps.map((step, index) => (
                    <HStack key={step.label} spacing={3}>
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

              <Box>
                <Text fontWeight="700" fontSize="md" color="gray.800" mb={3}>
                  Transaction Information
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      Amount:
                    </Text>
                    <Text fontSize="lg" fontWeight="bold">
                      ${parseFloat(String(transaction.amount)).toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      Item:
                    </Text>
                    <Text>{transaction.item_description}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      Buyer:
                    </Text>
                    <Text>{transaction.buyer_email}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      Seller:
                    </Text>
                    <Text>{transaction.seller_email}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      Payment Status:
                    </Text>
                    <Badge colorScheme={transaction.payment_received ? 'green' : 'yellow'}>
                      {transaction.payment_received ? 'Received' : 'Pending'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" color="gray.600">
                      File Status:
                    </Text>
                    <Badge colorScheme={transaction.file_uploaded ? 'green' : 'orange'}>
                      {transaction.file_uploaded ? 'Uploaded' : 'Pending'}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="700" fontSize="md" color="gray.800" mb={3}>
                  Actions
                </Text>
                <VStack spacing={3} align="stretch">
                  {paymentError && (
                    <Alert status="error" borderRadius="md" flexDirection="column" alignItems="flex-start">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">Payment issue</Text>
                        <Text fontSize="sm">{paymentError}</Text>
                  <Button size="sm" mt={2} colorScheme="red" variant="outline" onClick={() => { setPaymentError(null); transactionQuery.refetch(); }}>
                          Dismiss & refresh
                        </Button>
                      </Box>
                    </Alert>
                  )}

                  {currentUser?.email === transaction.buyer_email &&
                    !transaction.payment_received &&
                    transaction.status !== 'cancelled' &&
                    transaction.status !== 'refunded' && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          Payment status: <Badge colorScheme="yellow">Pending</Badge> — Complete payment to continue.
                        </Text>
                        {stripePromise && transaction.client_secret ? (
                          <Elements stripe={stripePromise} options={{ clientSecret: transaction.client_secret }}>
                            <VStack spacing={4} align="stretch">
                              <PaymentElement />
                              <ElementsConsumer>
                                {({ stripe, elements }) => (
                                  <Button
                                    colorScheme="green"
                                    size="lg"
                                    leftIcon={<ArrowForwardIcon />}
                                    onClick={() => handlePayment(stripe, elements)}
                                    isLoading={processingPayment}
                                    loadingText="Processing payment..."
                                    isDisabled={processingPayment}
                                  >
                                    Pay ${parseFloat(String(transaction.amount)).toFixed(2)} Now
                                  </Button>
                                )}
                              </ElementsConsumer>
                            </VStack>
                          </Elements>
                        ) : (
                          <Button
                            colorScheme="green"
                            size="lg"
                            leftIcon={<ArrowForwardIcon />}
                            onClick={() => handlePayment(null, null)}
                            isLoading={processingPayment}
                            loadingText="Opening payment..."
                            isDisabled={processingPayment}
                          >
                            Pay ${parseFloat(String(transaction.amount)).toFixed(2)} Now
                          </Button>
                        )}
                        {!transaction.client_secret && (
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            If the button doesn&apos;t work, refresh the page to load payment details.
                          </Text>
                        )}
                      </Box>
                    )}

                  {currentUser?.email === transaction.buyer_email &&
                    transaction.status !== 'cancelled' &&
                    transaction.status !== 'refunded' && (
                      <VStack spacing={3} align="stretch">
                        <Alert status="info" borderRadius="md" variant="left-accent">
                          <AlertIcon />
                          <Box flex="1">
                            <Text fontWeight="bold">Upload requirements or brief (optional)</Text>
                            <Text fontSize="sm">
                              Share a file with the seller so they know what to deliver. Max 25MB. Images, PDF, ZIP,
                              text.
                            </Text>
                          </Box>
                        </Alert>
                        {transaction.buyer_file_uploaded && transaction.buyer_file_name && (
                          <HStack p={2} bg="green.50" borderRadius="md">
                            <CheckCircleIcon color="green.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              Uploaded: {transaction.buyer_file_name}
                            </Text>
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
                              <Text fontSize="sm" fontWeight="bold">
                                {uploadProgress}%
                              </Text>
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

                  {currentUser?.email === transaction.seller_email &&
                    transaction.buyer_file_uploaded &&
                    transaction.buyer_file_name && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                          Buyer&apos;s requirements file
                        </Text>
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

                  {currentUser?.email === transaction.seller_email &&
                    transaction.status !== 'cancelled' &&
                    transaction.status !== 'refunded' &&
                    !transaction.file_uploaded && (
                      <VStack spacing={3} align="stretch">
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <Box flex="1">
                            <Text fontWeight="bold">Upload File</Text>
                            <Text fontSize="sm">
                              {transaction.payment_received
                                ? 'Payment has been received. Please upload the file for the buyer.'
                                : 'You can upload the file now. The buyer will be able to download it after they complete payment.'}{' '}
                              Max size: 25MB. Allowed: images, PDF, ZIP, text.
                            </Text>
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
                              <Text fontSize="sm" fontWeight="bold">
                                {uploadProgress}%
                              </Text>
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

                  {currentUser?.email === transaction.buyer_email &&
                    transaction.file_uploaded &&
                    transaction.payment_received && (
                      <Box>
                        {transaction.file_name && (
                          <HStack mb={2} p={2} bg="gray.50" borderRadius="md">
                            <DownloadIcon color="green.500" />
                            <Text fontSize="sm" fontWeight="medium">
                              {transaction.file_name}
                            </Text>
                          </HStack>
                        )}
                        <Button
                          colorScheme="green"
                          size="lg"
                          leftIcon={<DownloadIcon />}
                          onClick={() => handleDownload()}
                          isLoading={downloading}
                          loadingText="Downloading..."
                        >
                          Download File
                        </Button>
                      </Box>
                    )}

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

              {!transaction.payment_received && currentUser?.email === transaction.buyer_email && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">Payment Required</Text>
                    <Text fontSize="sm">
                      Complete the payment to proceed with this transaction. Your funds will be held securely until the
                      seller uploads the file.
                    </Text>
                  </Box>
                </Alert>
              )}

              {transaction.payment_received && !transaction.file_uploaded && currentUser?.email === transaction.seller_email && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">Payment Received</Text>
                    <Text fontSize="sm">
                      The buyer has completed payment. Please upload the file to complete the transaction.
                    </Text>
                  </Box>
                </Alert>
              )}

              {!transaction.payment_received &&
                !transaction.file_uploaded &&
                currentUser?.email === transaction.seller_email && (
                  <Alert status="info" borderRadius="md" variant="left-accent">
                    <AlertIcon />
                    <Box flex="1">
                      <Text fontWeight="bold">Upload anytime</Text>
                      <Text fontSize="sm">
                        You can upload the file for the buyer now. They will get access to download it after they complete
                        payment.
                      </Text>
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
                  <Text fontSize="sm">{transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : '—'}</Text>
                </Box>
                {transaction.completed_at && (
                  <Box textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                      Completed
                    </Text>
                    <Text fontSize="sm">{new Date(transaction.completed_at).toLocaleDateString()}</Text>
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
