import React from "react";
import { Box, Container, Flex, Spacer, HStack, Button, Icon, Heading, Avatar } from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { FiGrid } from "react-icons/fi";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NotificationCenter from "./NotificationCenter";

const navLinks = [
  { label: "How it works", path: "/how-it-works" },
  { label: "Features", path: "/features" },
  { label: "Testimonials", path: "/testimonials" }
];

const Navbar = ({ onLoginOpen }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  // Determine which links to show
  const currentPath = location.pathname;
  let filteredLinks = navLinks.filter(link => link.path !== currentPath);

  // Dashboard link is handled separately in the authenticated user section

  return (
    <Box bgGradient="linear(to-br, purple.500, purple.700)" px={{ base: 3, md: 4 }} position="fixed" w="full" zIndex={1000} boxShadow="0 2px 12px rgba(0,0,0,0.15)" borderBottom="1px solid" borderColor="whiteAlpha.200">
      <Container maxW="container.xl" px={{ base: 0, md: 4 }}>
        <Flex h={16} alignItems="center" flexWrap="wrap" gap={2}>
          <Button as={RouterLink} to="/" variant="link" fontWeight="bold" color="white" _hover={{ textDecoration: "underline" }} colorScheme="whiteAlpha" minH="44px" minW="44px">
            <HStack spacing={2}>
              <Icon as={LockIcon} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} />
              <Heading size="lg" display={{ base: "none", sm: "block" }}>SecureEscrow</Heading>
            </HStack>
          </Button>
          <Spacer />
          <HStack spacing={{ base: 1, md: 3 }} flexWrap="wrap" justify="flex-end">
            {filteredLinks.map(link => (
              <Button
                key={link.path}
                as={RouterLink}
                to={link.path}
                variant="link"
                color="white"
                fontSize="sm"
                px={2}
                minH="44px"
                _hover={{ textDecoration: "underline" }}
                display={{ base: "none", md: "inline-flex" }}
              >
                {link.label}
              </Button>
            ))}
            {isAuthenticated && currentUser ? (
              <HStack spacing={2}>
                <NotificationCenter />
                {currentUser.isAdmin && (
                  <Button
                    as={RouterLink}
                    to="/admin"
                    variant="ghost"
                    color="white"
                    fontSize="sm"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    bg="whiteAlpha.100"
                    _hover={{ bg: "whiteAlpha.200" }}
                    minH="44px"
                  >
                    Admin
                  </Button>
                )}
                <Button 
                  as={RouterLink} 
                  to="/dashboard" 
                  variant="ghost" 
                  color="white" 
                  fontWeight="bold"
                  fontSize="sm"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg="whiteAlpha.100"
                  _hover={{ bg: "whiteAlpha.200" }}
                  minW="auto"
                  minH="44px"
                  whiteSpace="nowrap"
                >
                  <HStack spacing={2} display={{ base: "none", sm: "flex" }}>
                    <Icon as={FiGrid} boxSize={4} />
                    <Box as="span">Dashboard</Box>
                  </HStack>
                  <Icon as={FiGrid} boxSize={5} display={{ base: "block", sm: "none" }} />
                </Button>
                <Button as={RouterLink} to="/profile" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }} p={1} minW={0} minH="44px" h="auto" bg="transparent" title="Profile">
                  <Avatar
                    size="sm"
                    name={currentUser.fullName || currentUser.email}
                    src={currentUser.avatarUrl || currentUser.photoURL}
                    border="2px solid #fff"
                    boxShadow="0 0 0 2px #9f7aea"
                    cursor="pointer"
                    _hover={{ boxShadow: "0 0 0 4px #d6bcfa", transform: "scale(1.08)", transition: "all 0.2s" }}
                    bgGradient="linear(to-br, purple.400, purple.600)"
                  />
                </Button>
              </HStack>
            ) : (
              <Button colorScheme="whiteAlpha" variant="ghost" color="white" onClick={onLoginOpen} minH="44px">Login</Button>
            )}
            <Button
              colorScheme="whiteAlpha"
              bg="white"
              color="purple.600"
              fontSize="sm"
              fontWeight="600"
              px={4}
              py={2}
              minH="44px"
              borderRadius="lg"
              _hover={{ bg: "gray.50", transform: "translateY(-1px)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              onClick={() => {
                if (isAuthenticated && currentUser) {
                  window.location.href = "/create-transaction";
                } else {
                  onLoginOpen();
                }
              }}
            >
              Start Transaction
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;