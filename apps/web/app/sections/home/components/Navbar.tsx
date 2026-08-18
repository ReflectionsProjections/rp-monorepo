import {
    Box,
    Flex,
    HStack,
    Image,
    Link,
    Text,
    VStack,
    useBreakpointValue,
    useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import rpLogo from '@app/sections/home/assets/Landing/rp-2026.svg';

const MotionBox = motion(Box);

type NavbarProps = { isFlush: boolean };

const NAV_LINKS = [
    { label: 'Schedule', to: '/#schedule', id: 'schedule' },
    { label: 'FAQ', to: '/#faq', id: 'faq' },
    { label: 'Sponsors', to: '/#sponsors', id: 'sponsors' },
    { label: 'Speakers', to: '/speakers', id: null },
];

const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const navLinkStyles = {
    color: '#FCF2F6',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: 'lg',
    px: 4,
    py: 2,
    borderRadius: 'full',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
    _hover: {
        textShadow: '0 0 10px rgba(252,200,240,0.9), 0 0 24px rgba(220,100,200,0.6)',
        borderColor: 'rgba(252,242,246,0.2)',
        bg: 'rgba(252,242,246,0.05)',
    },
};

const pillStyles = {
    borderRadius: 'full' as const,
    border: '1px solid',
    borderColor: 'rgba(252,242,246,0.15)',
    bg: 'rgba(125,28,86,0.25)',
    backdropFilter: 'blur(24px)',
    boxShadow: 'xl',
};

const scrollToHero = (callback?: () => void) => {
    callback?.();
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
};

const LogoBlock = ({ onClick }: { onClick?: () => void }) => (
    <Link
        as={NavLink}
        to="/"
        display="flex"
        alignItems="center"
        gap={3}
        flexShrink={0}
        _hover={{ textDecoration: 'none' }}
        onClick={() => scrollToHero(onClick)}
    >
        <Image
            src={rpLogo}
            alt="R|P 2026"
            h={{ base: '50px', lg: '40px', xl: '50px' }}
            w="auto"
            transition="transform 0.6s ease-in-out"
            transformOrigin="center"
            _hover={{ transform: 'rotate(360deg)' }}
        />
        <Text
            fontFamily="'Geist Pixel', sans-serif"
            fontWeight={400}
            fontSize={{ base: 'lg', lg: 'md', xl: 'lg' }}
            color="#FCF2F6"
            lineHeight="1"
            letterSpacing="0.02em"
            mt="6px"
            whiteSpace="nowrap"
        >
            R|P 2026
        </Text>
    </Link>
);

const Navbar = ({ isFlush }: NavbarProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { pathname } = useLocation();
    const compactHeight = useBreakpointValue({ base: 76, lg: 80 }) ?? 76;

    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const scrollContainer = document.getElementById('home-scroll-container');
        if (!scrollContainer) return;

        const previousOverflow = scrollContainer.style.overflow;
        scrollContainer.style.overflow = 'hidden';

        return () => {
            scrollContainer.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    const handleToggle = () => (isOpen ? onClose() : onOpen());

    return (
        <Flex
            as="nav"
            // Sticky mode renders as a flex child of a center-aligned VStack, where
            // left/right don't size the box the way they do for fixed mode.
            w="100%"
            position={isFlush ? 'sticky' : 'fixed'}
            top={isFlush ? 0 : { base: '4px', lg: '37px' }}
            left={0}
            right={0}
            zIndex={15}
            justify="center"
            px={{ base: 2, lg: 0 }}
        >
            {/* Desktop pill */}
            <HStack
                display={{ base: 'none', lg: 'flex' }}
                {...pillStyles}
                px={{ lg: 4, xl: 8 }}
                py={4}
                w="80%"
                maxW="1512px"
                justify="space-between"
                position="relative"
            >
                <LogoBlock />

                <HStack
                    gap={{ lg: 4, xl: 12, '2xl': 20 }}
                    position="absolute"
                    left="50%"
                    transform="translateX(-50%)"
                >
                    {NAV_LINKS.map(({ label, to, id }) => (
                        <Link
                            key={label}
                            as={NavLink}
                            to={to}
                            {...navLinkStyles}
                            _hover={{ ...navLinkStyles._hover, textDecoration: 'none' }}
                            onClick={id ? () => scrollTo(id) : undefined}
                        >
                            {label}
                        </Link>
                    ))}
                </HStack>

                {/* Login: /profile bounces through the sign-in flow when logged out */}
                <Link
                    as={NavLink}
                    to="/profile"
                    flexShrink={0}
                    fontFamily="Inter, sans-serif"
                    fontWeight={500}
                    fontSize="lg"
                    color="#FFFFFF"
                    bg="rgba(192,38,211,0.85)"
                    px={6}
                    py={2}
                    borderRadius="full"
                    transition="all 0.2s ease"
                    _hover={{
                        bg: 'rgba(192,38,211,1)',
                        textDecoration: 'none',
                        transform: 'scale(1.03)',
                    }}
                >
                    Login
                </Link>
            </HStack>

            {/* Mobile animated pill */}
            <MotionBox
                display={{ base: 'block', lg: 'none' }}
                w="calc(100% - 8px)"
                {...pillStyles}
                borderRadius="2xl"
                px="8px"
                overflow="hidden"
                maxH={isFlush ? '100dvh' : 'calc(100dvh - 8px)'}
                initial={false}
                animate={{
                    height: isOpen
                        ? isFlush
                            ? '100dvh'
                            : 'calc(100dvh - 8px)'
                        : `${compactHeight}px`,
                }}
                transition={{ height: { duration: 0.4, ease: 'easeOut' } }}
            >
                <Flex
                    py="12px"
                    px={1}
                    gap={8}
                    flexDir="column"
                    overflow={isOpen ? 'scroll' : 'hidden'}
                    maxH="100vh"
                >
                    <Flex px="3%" justify="space-between" align="center">
                        <LogoBlock onClick={onClose} />

                        <Box
                            as="button"
                            onClick={handleToggle}
                            w="30px"
                            h="20px"
                            position="relative"
                            cursor="pointer"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                            aria-controls="mobile-navigation"
                            mr={4}
                        >
                            {[0, 9, 18].map((topVal, i) => (
                                <Box
                                    key={i}
                                    position="absolute"
                                    h="3px"
                                    w="100%"
                                    bg="#FCF2F6"
                                    borderRadius="9px"
                                    transformOrigin="left center"
                                    transition="all 0.25s ease-in-out"
                                    top={
                                        isOpen ? (i === 1 ? `${topVal}px` : '18px') : `${topVal}px`
                                    }
                                    left={isOpen && i === 1 ? '50%' : '0'}
                                    style={{
                                        width: isOpen && i === 1 ? '0%' : '100%',
                                        transform: isOpen
                                            ? i === 0
                                                ? 'translateX(5px) translateY(-21px) rotate(45deg)'
                                                : i === 2
                                                  ? 'translateX(5px) translateY(0px) rotate(-45deg)'
                                                  : 'none'
                                            : 'none',
                                    }}
                                />
                            ))}
                        </Box>
                    </Flex>

                    {isOpen && (
                        <VStack as="nav" id="mobile-navigation" align="stretch" mb={16} gap={5}>
                            {NAV_LINKS.map(({ label, to, id }) => (
                                <Link
                                    key={label}
                                    as={NavLink}
                                    to={to}
                                    onClick={() => {
                                        onClose();
                                        if (id) scrollTo(id);
                                    }}
                                    w="100%"
                                    py="9px"
                                    px="33px"
                                    textAlign="center"
                                    rounded="xl"
                                    color="#FCF2F6"
                                    fontFamily="Inter, sans-serif"
                                    fontWeight={450}
                                    fontSize="3xl"
                                    _hover={{ bg: 'rgba(252,242,246,0.08)' }}
                                >
                                    {label}
                                </Link>
                            ))}

                            <Link
                                as={NavLink}
                                to="/profile"
                                onClick={onClose}
                                alignSelf="center"
                                mt={3}
                                px="44px"
                                py="10px"
                                textAlign="center"
                                rounded="full"
                                color="#FFFFFF"
                                bg="rgba(192,38,211,0.85)"
                                fontFamily="Inter, sans-serif"
                                fontWeight={500}
                                fontSize="2xl"
                                _hover={{ bg: 'rgba(192,38,211,1)' }}
                            >
                                Login
                            </Link>
                        </VStack>
                    )}
                </Flex>
            </MotionBox>
        </Flex>
    );
};

export default Navbar;
