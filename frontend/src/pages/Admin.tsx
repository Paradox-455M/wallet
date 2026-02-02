import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';
import type { ApiTransaction } from '../types/transactions';
import { cancelAdminTransaction, getAdminTransactions, refundTransaction } from '../api/admin';

const statusColor = (status: string, paymentReceived?: boolean, fileUploaded?: boolean) => {
  if (status === 'completed') return 'green';
  if (status === 'refunded') return 'purple';
  if (status === 'cancelled') return 'red';
  if (paymentReceived && !fileUploaded) return 'orange';
  if (!paymentReceived) return 'yellow';
  return 'blue';
};

const statusLabel = (transaction: ApiTransaction) => {
  if (transaction.status === 'completed') return 'Completed';
  if (transaction.status === 'refunded') return 'Refunded';
  if (transaction.status === 'cancelled') return 'Cancelled';
  if (transaction.payment_received && transaction.file_uploaded) return 'Ready';
  if (transaction.payment_received && !transaction.file_uploaded) return 'Awaiting File';
  return 'Awaiting Payment';
};

const Admin = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['admin-transactions', statusFilter],
    queryFn: () => getAdminTransactions(statusFilter || undefined),
  });

  useEffect(() => {
    if (!transactionsQuery.error) return;
    const msg =
      (transactionsQuery.error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
      (transactionsQuery.error as Error).message ||
      'Failed to load transactions';
    toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
  }, [transactionsQuery.error, toast]);

  const cancelMutation = useMutation({
    mutationFn: cancelAdminTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: refundTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    },
  });

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      await cancelMutation.mutateAsync(id);
      toast({ title: 'Cancelled', description: 'Transaction cancelled.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Cancel failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id: string) => {
    setActionLoading(id);
    try {
      await refundMutation.mutateAsync(id);
      toast({ title: 'Refunded', description: 'Refund processed.', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Refund failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  return (
    <Box minH="100vh" bg="gray.900" position="relative" overflowX="hidden" w="100%">
      <StarryBackground />
      <Navbar />
      <Box position="relative" zIndex={1} pt={24} pb={12} px={{ base: 4, md: 6 }}>
        <Box maxW="1400px" mx="auto">
          <VStack spacing={6} align="stretch">
            <Heading color="white" size="xl">
              Admin – Transactions
            </Heading>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Text fontSize="sm">List all transactions. Cancel (non-completed) or refund (payment received).</Text>
            </Alert>

            <HStack spacing={4} flexWrap="wrap">
              <Select
                placeholder="All statuses"
                value={statusFilter}
                onChange={handleStatusChange}
                maxW="200px"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
                color="white"
              >
                <option value="" style={{ background: '#1a202c', color: 'white' }}>
                  All
                </option>
                <option value="pending" style={{ background: '#1a202c', color: 'white' }}>
                  Pending
                </option>
                <option value="completed" style={{ background: '#1a202c', color: 'white' }}>
                  Completed
                </option>
                <option value="cancelled" style={{ background: '#1a202c', color: 'white' }}>
                  Cancelled
                </option>
                <option value="refunded" style={{ background: '#1a202c', color: 'white' }}>
                  Refunded
                </option>
              </Select>
              <Button colorScheme="purple" size="sm" onClick={() => transactionsQuery.refetch()}>
                Refresh
              </Button>
              <Button as={RouterLink} to="/dashboard" variant="outline" colorScheme="whiteAlpha" size="sm">
                Back to Dashboard
              </Button>
            </HStack>

            <Box
              bg="linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              overflowX="auto"
              minW="0"
              sx={{ '&::-webkit-scrollbar': { height: '8px' } }}
            >
              {transactionsQuery.isLoading ? (
                <Box py={12} textAlign="center">
                  <Spinner color="purple.400" size="lg" />
                  <Text color="gray.400" mt={4}>
                    Loading transactions...
                  </Text>
                </Box>
              ) : (transactionsQuery.data || []).length === 0 ? (
                <Box py={12} textAlign="center">
                  <Text color="gray.400">No transactions found.</Text>
                </Box>
              ) : (
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr borderBottom="2px" borderColor="whiteAlpha.300">
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        ID
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Buyer
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Seller
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Amount
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Status
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Created
                      </Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(transactionsQuery.data || []).map((transaction) => (
                      <Tr key={transaction.id} borderBottom="1px" borderColor="whiteAlpha.100" _hover={{ bg: 'whiteAlpha.05' }}>
                        <Td color="purple.300" fontSize="xs" fontFamily="mono">
                          {String(transaction.id).slice(0, 8)}…
                        </Td>
                        <Td color="white" fontSize="sm">
                          {transaction.buyer_email}
                        </Td>
                        <Td color="white" fontSize="sm">
                          {transaction.seller_email}
                        </Td>
                        <Td color="white" fontWeight="medium">
                          ${parseFloat(String(transaction.amount || 0)).toFixed(2)}
                        </Td>
                        <Td>
                          <Badge colorScheme={statusColor(transaction.status, transaction.payment_received, transaction.file_uploaded)} fontSize="xs">
                            {statusLabel(transaction)}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="xs">
                          {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : '—'}
                        </Td>
                        <Td>
                          <HStack spacing={2} flexWrap="wrap">
                            <Button as={RouterLink} to={`/transaction/${transaction.id}`} size="xs" colorScheme="gray" variant="outline">
                              View
                            </Button>
                            {transaction.status !== 'cancelled' && transaction.status !== 'completed' && transaction.status !== 'refunded' && (
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                isLoading={actionLoading === transaction.id}
                                onClick={() => handleCancel(transaction.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {transaction.payment_received && transaction.status !== 'refunded' && transaction.status !== 'cancelled' && (
                              <Button
                                size="xs"
                                colorScheme="purple"
                                variant="outline"
                                isLoading={actionLoading === transaction.id}
                                onClick={() => handleRefund(transaction.id)}
                              >
                                Refund
                              </Button>
                            )}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Admin;
