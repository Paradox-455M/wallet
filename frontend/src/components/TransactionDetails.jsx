import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import axios from 'axios';

const TransactionDetails = ({ transactionId }) => {
  const [transaction, setTransaction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const toast = useToast();

  const fetchTransaction = async () => {
    try {
      const { data } = await axios.get(`/api/transactions/${transactionId}`);
      setTransaction(data);

      if (data.file_uploaded && data.payment_received) {
        fetchDownloadUrl();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchDownloadUrl = async () => {
    try {
      const { data } = await axios.get(`/api/transactions/${transactionId}/download`);
      setDownloadUrl(data.downloadUrl);
    } catch (error) {
      console.error('Error fetching download URL:', error);
    }
  };

  useEffect(() => {
    fetchTransaction();
    const interval = setInterval(fetchTransaction, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [transactionId]);

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
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`/api/transactions/${transactionId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      fetchTransaction();
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!transaction) {
    return <Progress size="xs" isIndeterminate />;
  }

  const getStatusColor = () => {
    if (transaction.status === 'completed') return 'green.500';
    if (transaction.payment_received && transaction.file_uploaded) return 'green.500';
    if (transaction.payment_received || transaction.file_uploaded) return 'orange.500';
    return 'gray.500';
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" textAlign="center">Transaction Details</Text>

        <Box>
          <Text fontWeight="bold">Status</Text>
          <Text color={getStatusColor()}>
            {transaction.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Amount</Text>
          <Text>${transaction.amount}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Item Description</Text>
          <Text>{transaction.item_description}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold">Payment Status</Text>
          <Text color={transaction.payment_received ? 'green.500' : 'orange.500'}>
            {transaction.payment_received ? 'Received' : 'Pending'}
          </Text>
        </Box>

        <Box>
          <Text fontWeight="bold">File Status</Text>
          <Text color={transaction.file_uploaded ? 'green.500' : 'orange.500'}>
            {transaction.file_uploaded ? 'Uploaded' : 'Pending'}
          </Text>
        </Box>

        {!transaction.file_uploaded && (
          <VStack spacing={4}>
            <Input
              type="file"
              onChange={handleFileChange}
              accept="*/*"
              disabled={uploading}
            />
            <Button
              colorScheme="blue"
              onClick={handleFileUpload}
              isLoading={uploading}
              loadingText="Uploading..."
              disabled={!selectedFile || uploading}
            >
              Upload File
            </Button>
          </VStack>
        )}

        {downloadUrl && (
          <Button
            as={Link}
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            colorScheme="green"
          >
            Download File
          </Button>
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
  );
};

export default TransactionDetails;