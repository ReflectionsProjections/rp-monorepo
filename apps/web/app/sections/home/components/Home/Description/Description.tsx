import { Box, Heading, Text } from '@chakra-ui/react';

const ABOUT_COPY = [
    "Reflections | Projections is the Midwest's largest student-run technology conference. Every fall, we bring students, creators, researchers, and industry leaders together at the University of Illinois Urbana-Champaign.",
    'Join us September 16–19 for four days of inspiring speakers, technical talks, a career fair, workshops, free food, merch, and the ideas shaping what comes next.',
];

export const Description = () => {
    return (
        <Box
            as="section"
            id="description"
            aria-labelledby="about-heading"
            position="relative"
            w="100%"
            aspectRatio="1512 / 1926"
            overflow="hidden"
            color="white"
            bgColor="transparent"
            zIndex={2}
            bgImage="url('/site/about/about.svg')"
            bgSize={{ base: '130% 130%', md: '102% 102%' }}
            bgPosition={{ base: 'left 60% bottom 8%', md: 'left 60% bottom 80%' }}
            bgRepeat="no-repeat"
        >
            <Box
                position="absolute"
                top={{ base: '36%', md: '49%' }}
                right={{ base: '5%', md: '12%' }}
                bottom={{ xs: '10%', base: '30%', md: '27%' }}
                left={{ base: '7.5%', md: '18.5%' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Heading
                    id="about-heading"
                    fontFamily="'Geist Pixel', sans-serif"
                    fontWeight={400}
                    fontSize={{
                        base: 'clamp(1.15rem, 5.2vw, 2.75rem)',
                        md: 'clamp(2.25rem, 3.6vw, 4.25rem)',
                    }}
                    lineHeight={1.05}
                    textAlign="center"
                    whiteSpace={{ xl: 'nowrap' }}
                    mb={{ base: 2, md: 5 }}
                >
                    Welcome to R|P!
                </Heading>

                {ABOUT_COPY.map((paragraph) => (
                    <Text
                        key={paragraph}
                        mx="auto"
                        mb={{ base: 2, md: 5 }}
                        maxW="62ch"
                        fontFamily="Inter, sans-serif"
                        fontWeight={450}
                        fontSize={{
                            base: 'clamp(1rem, 3.3vw, 1.25rem)',
                            md: 'clamp(1.125rem, 1.55vw, 1.375rem)',
                        }}
                        textAlign="center"
                        lineHeight={{ base: 1.55, md: 1.6 }}
                    >
                        {paragraph}
                    </Text>
                ))}
            </Box>
        </Box>
    );
};

export default Description;
