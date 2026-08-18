import { FAQS } from '@app/sections/home/constants/faq-questions';
import { Box, Image, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';

import { FAQQuestion } from './FAQQuestion';

const FULL_WALL_PATTERNS = [
    '0.7fr 1.25fr 0.8fr 1.35fr 1fr 0.75fr',
    '1.15fr 0.78fr 1.3fr 0.72fr 1.08fr 0.92fr',
    '0.82fr 1.18fr 0.68fr 1.22fr 0.95fr 1.12fr',
];

const SIDE_WALL_PATTERNS = [
    '0.58fr 1.18fr',
    '1.22fr 0.64fr',
    '0.72fr 1.08fr',
    '1.1fr 0.7fr',
    '0.62fr 1.2fr',
    '1.24fr 0.58fr',
    '0.78fr 1.02fr',
    '1.06fr 0.74fr',
];

const SIDE_WALL_REACHES = [
    { top: 78, bottom: 68 },
    { top: 56, bottom: 40 },
    { top: 30, bottom: 30 },
    { top: 42, bottom: 58 },
    { top: 72, bottom: 88 },
];

type BrickCourseProps = {
    pattern: string;
    offset?: 'left' | 'right';
    reach?: number;
    size?: 'full' | 'side';
};

const BrickCourse = ({ pattern, offset, reach = 100, size = 'full' }: BrickCourseProps) => (
    <Box
        aria-hidden
        display="grid"
        gridTemplateColumns={pattern}
        gap="8px"
        w={size === 'full' ? '100%' : `${reach}%`}
        ml={size === 'full' ? '0' : offset === 'right' ? 'auto' : '0'}
    >
        {pattern.split(' ').map((_, index) => (
            <Box
                key={`${pattern}-${index}`}
                h={
                    size === 'full'
                        ? 'clamp(52px, 5.7vw, 86px)'
                        : 'calc((clamp(86px, 8.7vw, 132px) - 8px) / 2)'
                }
                borderRadius="8px"
                bg="#494152"
            />
        ))}
    </Box>
);

const WallColumns = ({ children }: { children: ReactNode }) => (
    <Box
        display="grid"
        gridTemplateColumns="minmax(70px, 1fr) minmax(0, 64vw) minmax(70px, 1fr)"
        columnGap={{ lg: '8px' }}
        alignItems="stretch"
        w="100%"
    >
        {children}
    </Box>
);

const TopWall = () => (
    <VStack
        aria-hidden
        position="absolute"
        top="88px"
        insetX={0}
        display={{ base: 'none', lg: 'flex' }}
        align="stretch"
        spacing="8px"
        zIndex={0}
        pointerEvents="none"
    >
        <BrickCourse pattern={FULL_WALL_PATTERNS[0]} offset="left" />
    </VStack>
);

type WallCellProps = {
    side: 'left' | 'right';
    index: number;
};

const WallCell = ({ side, index }: WallCellProps) => {
    const patternOffset = side === 'left' ? 0 : 3;
    const topPattern = SIDE_WALL_PATTERNS[(index * 2 + patternOffset) % SIDE_WALL_PATTERNS.length];
    const bottomPattern =
        SIDE_WALL_PATTERNS[(index * 2 + patternOffset + 1) % SIDE_WALL_PATTERNS.length];
    const { top: topReach, bottom: bottomReach } = SIDE_WALL_REACHES[index];

    return (
        <Box
            aria-hidden
            display={{ base: 'none', lg: 'flex' }}
            flexDirection="column"
            justifyContent="space-between"
            alignSelf="stretch"
            minH="clamp(86px, 8.7vw, 132px)"
            overflow="hidden"
            pointerEvents="none"
            sx={{ contain: 'layout paint' }}
        >
            <BrickCourse
                pattern={topReach <= 42 ? '1fr' : topPattern}
                offset={side}
                reach={topReach}
                size="side"
            />
            <BrickCourse
                pattern={bottomReach <= 42 ? '1fr' : bottomPattern}
                offset={side}
                reach={bottomReach}
                size="side"
            />
        </Box>
    );
};

const BottomWall = () => (
    <Box
        position="relative"
        h={{ base: '180px', md: '220px', lg: '220px' }}
        mt={{ base: 7, lg: '8px' }}
        overflow="hidden"
    >
        <VStack
            aria-hidden
            display={{ base: 'none', lg: 'flex' }}
            align="stretch"
            spacing="8px"
            pointerEvents="none"
        >
            <WallColumns>
                <BrickCourse pattern={SIDE_WALL_PATTERNS[6]} size="side" reach={100} />
                <Box />
                <BrickCourse
                    pattern={SIDE_WALL_PATTERNS[2]}
                    offset="right"
                    size="side"
                    reach={100}
                />
            </WallColumns>
            <BrickCourse pattern={FULL_WALL_PATTERNS[0]} offset="right" />
        </VStack>

        <Image
            src="/site/faq/faq-graffiti-transparent.png"
            alt=""
            aria-hidden
            position="absolute"
            left={{ base: '-8%', lg: '-1%' }}
            bottom={{ base: 0, lg: '-1%' }}
            zIndex={2}
            w={{ base: '76%', lg: '39%' }}
            maxW={{ lg: '590px' }}
            pointerEvents="none"
        />

        <Image
            src="/site/faq/faq-crown.png"
            alt=""
            aria-hidden
            position="absolute"
            right={{ base: '-12%', lg: '-1%' }}
            bottom={{ base: '-22px', lg: '-4%' }}
            zIndex={2}
            w={{ base: '50%', lg: '25%' }}
            maxW={{ lg: '381px' }}
            pointerEvents="none"
        />
    </Box>
);

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <Box
            as="section"
            id="faq"
            aria-label="Frequently asked questions"
            position="relative"
            w="100%"
            mx="auto"
            overflow="hidden"
            bg="#18111d"
            sx={{ overflowAnchor: 'none' }}
        >
            <TopWall />

            <Box
                aria-hidden
                position="absolute"
                top={{ base: '7%', lg: '8.9%' }}
                left={{ base: '-28%', md: '4%', lg: '19%' }}
                zIndex={1}
                w={{ base: '156%', md: '92%', lg: '57.7%' }}
                aspectRatio={1}
                borderRadius="full"
                bg="radial-gradient(circle, rgba(164, 105, 157, 0.76) 0%, rgba(122, 76, 118, 0.68) 56%, rgba(72, 43, 75, 0.22) 67%, rgba(59, 36, 63, 0) 73%)"
                filter="blur(4px)"
            />

            <Box
                position="relative"
                zIndex={2}
                display="grid"
                gridTemplateColumns={{
                    base: 'minmax(0, 1fr)',
                    lg: 'minmax(70px, 1fr) minmax(0, 64vw) minmax(70px, 1fr)',
                }}
                columnGap={{ lg: '8px' }}
                rowGap={{ base: 4, lg: '8px' }}
                alignItems="stretch"
                w={{ base: 'calc(100% - 32px)', lg: '100%' }}
                mx="auto"
                pt={{ base: '132px', md: '140px', lg: '182px' }}
            >
                {FAQS.map((faqItem, index) => (
                    <Fragment key={faqItem.question}>
                        <WallCell side="left" index={index} />
                        <FAQQuestion
                            index={index}
                            faqItem={faqItem}
                            isOpen={openIndex === index}
                            onToggle={() =>
                                setOpenIndex((current) => (current === index ? null : index))
                            }
                        />
                        <WallCell side="right" index={index} />
                    </Fragment>
                ))}
            </Box>

            <BottomWall />
        </Box>
    );
};
