import { useMemo } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Spinner,
  useToast,
  Divider,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import type { NotificationItem } from '../types/notifications';

const formatTime = (dateStr?: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationCenter = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications({
    pollInterval: 60000,
  });
  const toast = useToast();

  const visibleNotifications = useMemo(() => notifications.slice(0, 20), [notifications]);

  if (!isAuthenticated) return null;

  const handleMarkAll = async () => {
    await markAllAsRead();
    toast({
      title: 'All caught up',
      description: 'All notifications marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleItemClick = async (notification: NotificationItem) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
  };

  return (
    <Menu closeOnSelect={false} placement="bottom-end">
      <MenuButton
        as={IconButton}
        aria-label="Notifications"
        icon={<BellIcon boxSize={5} />}
        variant="ghost"
        color="white"
        _hover={{ bg: 'whiteAlpha.200' }}
        position="relative"
      >
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="4px"
            right="4px"
            colorScheme="red"
            borderRadius="full"
            fontSize="xs"
            minW="18px"
            h="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </MenuButton>
      <MenuList
        maxW="400px"
        maxH="80vh"
        overflowY="auto"
        bg="gray.800"
        borderColor="whiteAlpha.200"
        color="white"
      >
        <Box px={4} py={3} borderBottomWidth="1px" borderColor="whiteAlpha.200">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" colorScheme="purple" leftIcon={<CheckIcon />} onClick={handleMarkAll}>
                Mark all read
              </Button>
            )}
          </HStack>
        </Box>
        {loading && notifications.length === 0 ? (
          <Box py={8} textAlign="center">
            <Spinner color="purple.400" />
          </Box>
        ) : notifications.length === 0 ? (
          <Box py={8} textAlign="center" color="gray.400">
            <Text>No notifications yet</Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={0} divider={<Divider borderColor="whiteAlpha.100" />}>
            {visibleNotifications.map((notification) => (
              <MenuItem
                key={notification.id}
                as={Box}
                py={3}
                px={4}
                bg={notification.read_at ? 'transparent' : 'whiteAlpha.50'}
                _hover={{ bg: 'whiteAlpha.100' }}
                cursor="pointer"
                onClick={() => handleItemClick(notification)}
              >
                <ChakraLink
                  as={RouterLink}
                  to={notification.transaction_id ? `/transaction/${notification.transaction_id}` : '/dashboard'}
                  _hover={{ textDecoration: 'none' }}
                  flex={1}
                  onClick={() => document.body.click?.()}
                >
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontWeight={notification.read_at ? 'normal' : 'semibold'} fontSize="sm" noOfLines={1}>
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {formatTime(notification.created_at)}
                      </Text>
                    </HStack>
                    {notification.message && (
                      <Text fontSize="xs" color="gray.400" noOfLines={2}>
                        {notification.message}
                      </Text>
                    )}
                  </VStack>
                </ChakraLink>
              </MenuItem>
            ))}
          </VStack>
        )}
      </MenuList>
    </Menu>
  );
};

export default NotificationCenter;
