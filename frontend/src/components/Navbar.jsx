import React from "react";
import { Box, Container, Flex, Spacer, HStack, Button, Icon, Heading, Avatar, useColorModeValue } from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { label: "How it works", path: "/how-it-works" },
  { label: "Features", path: "/features" },
  { label: "Testimonials", path: "/testimonials" }
];

const Navbar = ({ onLoginOpen }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  // Determine which links to show
  const currentPath = location.pathname;
  let filteredLinks = navLinks.filter(link => link.path !== currentPath);

  // Insert Dashboard link if authenticated
  if (isAuthenticated && currentUser) {
    filteredLinks = [
      { label: "Dashboard", path: "/dashboard" },
      ...filteredLinks
    ];
  }

  return (
    <Box bgGradient="linear(to-br, purple.400, purple.600)" px={4} position="fixed" w="full" zIndex={1000} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center">
          <Button as={RouterLink} to="/" variant="link" fontWeight="bold" color="white" _hover={{ textDecoration: "underline" }} colorScheme="whiteAlpha">
            <HStack spacing={2}>
              <Icon as={LockIcon} w={8} h={8} />
              <Heading size="lg">SecureEscrow</Heading>
            </HStack>
          </Button>
          <Spacer />
          <HStack spacing={4}>
            {filteredLinks.map(link => (
              <Button
                key={link.path}
                as={RouterLink}
                to={link.path}
                variant="link"
                color="white"
                _hover={{ textDecoration: "underline" }}
              >
                {link.label}
              </Button>
            ))}
            {isAuthenticated && currentUser ? (
              <HStack spacing={3}>
                <Button 
                  as={RouterLink} 
                  to="/dashboard" 
                  variant="ghost" 
                  color="white" 
                  fontWeight="bold"
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="md"
                  bg="whiteAlpha.100"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  📊 Dashboard
                </Button>
                <Button as={RouterLink} to="/dashboard" variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }} p={0} minW={0} h="auto" bg="transparent">
                  <Avatar
                    size="md"
                    name={currentUser.fullName || currentUser.email}
                    src={currentUser.photoURL}
                    border="2px solid #fff"
                    boxShadow="0 0 0 3px #9f7aea"
                    cursor="pointer"
                    _hover={{ boxShadow: "0 0 0 4px #d6bcfa", transform: "scale(1.08)", transition: "all 0.2s" }}
                    bgGradient="linear(to-br, purple.400, purple.600)"
                  />
                </Button>
              </HStack>
            ) : (
              <Button colorScheme="whiteAlpha" variant="ghost" color="white" onClick={onLoginOpen}>Login</Button>
            )}
            <Button
              colorScheme="whiteAlpha"
              bg="white"
              color="purple.600"
              _hover={{ bg: "gray.100" }}
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