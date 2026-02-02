import { Box, Heading, VStack, Text, HStack, Badge } from '@chakra-ui/react';

type TransactionSectionProps = {
  title: string;
  transactions?: TransactionSectionItem[];
  emptyMessage: string;
};

export type TransactionSectionItem = {
  id: number;
  amount: string;
  status: 'active' | 'completed';
  date: string;
  counterparty: string;
};

const TransactionSection = ({ title, emptyMessage, transactions = [] }: TransactionSectionProps) => {

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(20px)"
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      mb={6}
    >
      <Heading fontSize="2xl" mb={4} color="white">
        {title}
      </Heading>

      {transactions.length === 0 ? (
        <Text color="whiteAlpha.600">{emptyMessage}</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {transactions.map((transaction) => (
            <Box key={transaction.id} p={4} bg="whiteAlpha.50" borderRadius="md" _hover={{ bg: 'whiteAlpha.100' }}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text color="white" fontWeight="medium">
                    {transaction.amount}
                  </Text>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {transaction.counterparty}
                  </Text>
                </VStack>

                <VStack align="end" spacing={1}>
                  <Badge colorScheme={transaction.status === 'completed' ? 'green' : 'orange'} variant="subtle">
                    {transaction.status}
                  </Badge>
                  <Text color="whiteAlpha.600" fontSize="sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default TransactionSection;
