import { Box, VStack, Heading, Text, Input, Button, FormControl, FormLabel, InputGroup, InputLeftElement, InputRightElement, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { MdEmail, MdPerson, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box
      w="100%"
      minH="100vh"
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Blurred background image */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage="url('/site/about/about-skyline.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        filter="blur(8px)"
        transform="scale(1.05)"
        zIndex={0}
      />

      {/* Dark overlay for contrast */}
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(135deg, rgba(18, 19, 26, 0.85) 0%, rgba(123, 2, 1, 0.55) 50%, rgba(18, 19, 26, 0.85) 100%)"
        zIndex={1}
      />

      {/* Animated floating particles (decorative) */}
      {[...Array(6)].map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          borderRadius="50%"
          bg={`rgba(${180 + i * 15}, ${100 + i * 20}, ${220 + i * 5}, ${0.08 + i * 0.02})`}
          w={`${60 + i * 40}px`}
          h={`${60 + i * 40}px`}
          zIndex={1}
          initial={{
            x: `${10 + i * 15}vw`,
            y: `${15 + i * 12}vh`,
          }}
          animate={{
            y: [`${15 + i * 12}vh`, `${10 + i * 12}vh`, `${15 + i * 12}vh`],
            x: [`${10 + i * 15}vw`, `${12 + i * 15}vw`, `${10 + i * 15}vw`],
          }}
          transition={{
            duration: 4 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Registration card */}
      <MotionVStack
        position="relative"
        zIndex={2}
        bg="rgba(255, 255, 255, 0.06)"
        backdropFilter="blur(24px)"
        border="1px solid rgba(255, 255, 255, 0.12)"
        borderRadius="24px"
        p={{ base: 8, md: 12 }}
        w={{ base: "90%", sm: "440px", md: "480px" }}
        gap={6}
        boxShadow="0 8px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Header */}
        <VStack gap={2} w="100%">
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Heading
              size="xl"
              fontFamily="Ethnocentric"
              color="white"
              textAlign="center"
              letterSpacing="2px"
            >
              R|P 2026
            </Heading>
          </MotionBox>
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Text
              fontSize="md"
              fontFamily="Magistral"
              color="rgba(255, 255, 255, 0.65)"
              textAlign="center"
              letterSpacing="0.5px"
            >
              Create your account
            </Text>
          </MotionBox>
        </VStack>

        {/* Form fields */}
        <VStack gap={5} w="100%">
          {/* Email */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FormControl>
              <FormLabel
                fontFamily="Magistral"
                fontSize="sm"
                color="rgba(255, 255, 255, 0.7)"
                mb={1.5}
              >
                Email
              </FormLabel>
              <InputGroup>
                <InputLeftElement h="100%" pl={1}>
                  <MdEmail color="rgba(255,255,255,0.4)" size={18} />
                </InputLeftElement>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  borderRadius="12px"
                  color="white"
                  fontFamily="inter"
                  fontSize="sm"
                  h="48px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.3)" }}
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.25)" }}
                  _focus={{
                    borderColor: "rgba(200, 120, 255, 0.6)",
                    boxShadow: "0 0 0 1px rgba(200, 120, 255, 0.3)",
                  }}
                />
              </InputGroup>
            </FormControl>
          </MotionBox>

          {/* Username */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <FormControl>
              <FormLabel
                fontFamily="Magistral"
                fontSize="sm"
                color="rgba(255, 255, 255, 0.7)"
                mb={1.5}
              >
                Username
              </FormLabel>
              <InputGroup>
                <InputLeftElement h="100%" pl={1}>
                  <MdPerson color="rgba(255,255,255,0.4)" size={18} />
                </InputLeftElement>
                <Input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  borderRadius="12px"
                  color="white"
                  fontFamily="inter"
                  fontSize="sm"
                  h="48px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.3)" }}
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.25)" }}
                  _focus={{
                    borderColor: "rgba(200, 120, 255, 0.6)",
                    boxShadow: "0 0 0 1px rgba(200, 120, 255, 0.3)",
                  }}
                />
              </InputGroup>
            </FormControl>
          </MotionBox>

          {/* Password */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <FormControl>
              <FormLabel
                fontFamily="Magistral"
                fontSize="sm"
                color="rgba(255, 255, 255, 0.7)"
                mb={1.5}
              >
                Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement h="100%" pl={1}>
                  <MdLock color="rgba(255,255,255,0.4)" size={18} />
                </InputLeftElement>
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  borderRadius="12px"
                  color="white"
                  fontFamily="inter"
                  fontSize="sm"
                  h="48px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.3)" }}
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.25)" }}
                  _focus={{
                    borderColor: "rgba(200, 120, 255, 0.6)",
                    boxShadow: "0 0 0 1px rgba(200, 120, 255, 0.3)",
                  }}
                />
                <InputRightElement h="100%" pr={1}>
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    variant="ghost"
                    size="sm"
                    color="rgba(255,255,255,0.4)"
                    _hover={{ color: "rgba(255,255,255,0.7)", bg: "transparent" }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </MotionBox>

          {/* Confirm Password */}
          <MotionBox
            w="100%"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <FormControl>
              <FormLabel
                fontFamily="Magistral"
                fontSize="sm"
                color="rgba(255, 255, 255, 0.7)"
                mb={1.5}
              >
                Confirm Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement h="100%" pl={1}>
                  <MdLock color="rgba(255,255,255,0.4)" size={18} />
                </InputLeftElement>
                <Input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid rgba(255, 255, 255, 0.12)"
                  borderRadius="12px"
                  color="white"
                  fontFamily="inter"
                  fontSize="sm"
                  h="48px"
                  _placeholder={{ color: "rgba(255, 255, 255, 0.3)" }}
                  _hover={{ borderColor: "rgba(255, 255, 255, 0.25)" }}
                  _focus={{
                    borderColor: "rgba(200, 120, 255, 0.6)",
                    boxShadow: "0 0 0 1px rgba(200, 120, 255, 0.3)",
                  }}
                />
                <InputRightElement h="100%" pr={1}>
                  <IconButton
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    icon={showConfirmPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    variant="ghost"
                    size="sm"
                    color="rgba(255,255,255,0.4)"
                    _hover={{ color: "rgba(255,255,255,0.7)", bg: "transparent" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </MotionBox>
        </VStack>

        {/* Submit button */}
        <MotionBox
          w="100%"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            id="register-submit"
            w="100%"
            h="52px"
            bg="linear-gradient(135deg, rgba(200, 120, 255, 0.8), rgba(123, 2, 1, 0.9))"
            color="white"
            fontFamily="Magistral"
            fontSize="md"
            letterSpacing="1px"
            borderRadius="14px"
            border="1px solid rgba(255, 255, 255, 0.1)"
            _hover={{
              bg: "linear-gradient(135deg, rgba(200, 120, 255, 0.95), rgba(153, 12, 11, 1))",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 24px rgba(200, 120, 255, 0.3)",
            }}
            _active={{
              transform: "translateY(0px)",
              boxShadow: "0 2px 8px rgba(200, 120, 255, 0.2)",
            }}
            transition="all 0.25s ease"
          >
            Create Account
          </Button>
        </MotionBox>

        {/* Sign in link */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Text
            fontSize="sm"
            fontFamily="inter"
            color="rgba(255, 255, 255, 0.5)"
            textAlign="center"
          >
            Already have an account?{" "}
            <Box
              as="span"
              color="rgba(200, 150, 255, 0.85)"
              cursor="pointer"
              _hover={{ color: "white", textDecoration: "underline" }}
              transition="all 0.2s ease"
            >
              Sign in
            </Box>
          </Text>
        </MotionBox>
      </MotionVStack>
    </Box>
  );
};

export default RegisterPage;
