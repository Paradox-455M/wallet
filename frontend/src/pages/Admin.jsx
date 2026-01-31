import React, { useState, useEffect, useCallback } from 'react';
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
import axios from 'axios';
import Navbar from '../components/Navbar';
import StarryBackground from '../components/StarryBackground';

const statusColor = (status, paymentReceived, fileUploaded) => {
  if (status === 'completed') return 'green';
  if (status === 'refunded') return 'purple';
  if (status === 'cancelled') return 'red';
  if (paymentReceived && !fileUploaded) return 'orange';
  if (!paymentReceived) return 'yellow';
  return 'blue';
};

const statusLabel = (t) => {
  if (t.status === 'completed') return 'Completed';
  if (t.status === 'refunded') return 'Refunded';
  if (t.status === 'cancelled') return 'Cancelled';
  if (t.payment_received && t.file_uploaded) return 'Ready';
  if (t.payment_received && !t.file_uploaded) return 'Awaiting File';
  return 'Awaiting Payment';
};

const Admin = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  const fetchList = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await axios.get('/api/admin/transactions', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load transactions';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    setLoading(true);
    fetchList();
  }, [fetchList]);

  const handleCancel = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/transactions/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Cancelled', description: 'Transaction cancelled.', status: 'success', duration: 3000, isClosable: true });
      fetchList();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Cancel failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/transactions/${id}/refund`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Refunded', description: 'Refund processed.', status: 'success', duration: 3000, isClosable: true });
      fetchList();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Refund failed';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" position="relative">
      <StarryBackground />
      <Navbar />
      <Box position="relative" zIndex={1} pt={24} pb={12} px={{ base: 4, md: 6 }}>
        <Box maxW="1400px" mx="auto">
          <VStack spacing={6} align="stretch">
            <Heading color="white" size="xl">Admin – Transactions</Heading>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Text fontSize="sm">List all transactions. Cancel (non-completed) or refund (payment received).</Text>
            </Alert>

            <HStack spacing={4} flexWrap="wrap">
              <Select
                placeholder="All statuses"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW="200px"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.200"
                color="white"
              >
                <option value="" style={{ background: '#1a202c', color: 'white' }}>All</option>
                <option value="pending" style={{ background: '#1a202c', color: 'white' }}>Pending</option>
                <option value="completed" style={{ background: '#1a202c', color: 'white' }}>Completed</option>
                <option value="cancelled" style={{ background: '#1a202c', color: 'white' }}>Cancelled</option>
                <option value="refunded" style={{ background: '#1a202c', color: 'white' }}>Refunded</option>
              </Select>
              <Button colorScheme="purple" size="sm" onClick={() => { setLoading(true); fetchList(); }}>Refresh</Button>
              <Button as={RouterLink} to="/dashboard" variant="outline" colorScheme="whiteAlpha" size="sm">Back to Dashboard</Button>
            </HStack>

            <Box
              bg="linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              overflowX="auto"
            >
              {loading ? (
                <Box py={12} textAlign="center">
                  <Spinner color="purple.400" size="lg" />
                  <Text color="gray.400" mt={4}>Loading transactions...</Text>
                </Box>
              ) : transactions.length === 0 ? (
                <Box py={12} textAlign="center">
                  <Text color="gray.400">No transactions found.</Text>
                </Box>
              ) : (
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr borderBottom="2px" borderColor="whiteAlpha.300">
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">ID</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Buyer</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Seller</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Amount</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Status</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Created</Th>
                      <Th color="purple.200" fontWeight="bold" textTransform="uppercase" fontSize="xs">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((t) => (
                      <Tr key={t.id} borderBottom="1px" borderColor="whiteAlpha.100" _hover={{ bg: 'whiteAlpha.05' }}>
                        <Td color="purple.300" fontSize="xs" fontFamily="mono">{String(t.id).slice(0, 8)}…</Td>
                        <Td color="white" fontSize="sm">{t.buyer_email}</Td>
                        <Td color="white" fontSize="sm">{t.seller_email}</Td>
                        <Td color="white" fontWeight="medium">${parseFloat(t.amount || 0).toFixed(2)}</Td>
                        <Td>
                          <Badge colorScheme={statusColor(t.status, t.payment_received, t.file_uploaded)} fontSize="xs">
                            {statusLabel(t)}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="xs">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
                        </Td>
                        <Td>
                          <HStack spacing={2} flexWrap="wrap">
                            <Button
                              as={RouterLink}
                              to={`/transaction/${t.id}`}
                              size="xs"
                              colorScheme="gray"
                              variant="outline"
                            >
                              View
                            </Button>
                            {t.status !== 'cancelled' && t.status !== 'completed' && t.status !== 'refunded' && (
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="outline"
                                isLoading={actionLoading === t.id}
                                onClick={() => handleCancel(t.id)}
                              >
                                Cancel
                              </Button>
                            )}
                            {t.payment_received && t.status !== 'refunded' && t.status !== 'cancelled' && (
                              <Button
                                size="xs"
                                colorScheme="purple"
                                variant="outline"
                                isLoading={actionLoading === t.id}
                                onClick={() => handleRefund(t.id)}
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
