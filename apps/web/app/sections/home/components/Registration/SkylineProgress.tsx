import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { SECTIONS } from './sections';

type SkylineProgressProps = {
    done: boolean[];
    percent: number;
};

/**
 * The city-skyline progress strip: one tower per section that lights up when
 * the section is complete, over a fill line tracking overall completion.
 */
const SkylineProgress = ({ done, percent }: SkylineProgressProps) => (
    <Box
        position="relative"
        h="74px"
        mb="26px"
        borderRadius="14px"
        border="1px solid"
        borderColor="rgba(252,242,246,0.12)"
        bg="rgba(15,6,45,0.5)"
        backdropFilter="blur(18px)"
        overflow="hidden"
    >
        <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            h="2px"
            bg="rgba(252,242,246,0.12)"
        />
        <Box
            position="absolute"
            left={0}
            bottom={0}
            h="2px"
            w={`${percent}%`}
            bgGradient="linear(90deg, #EF539E, #5CE1E6)"
            boxShadow="0 0 14px rgba(92,225,230,0.7)"
            transition="width 0.45s ease"
        />
        <Flex
            position="absolute"
            inset={0}
            align="flex-end"
            justify="space-around"
            px={{ base: '10px', md: '22px' }}
        >
            {SECTIONS.map((section, index) => (
                <VStack key={section.towerLabel} spacing="5px" w="16%">
                    <Text
                        fontSize="9.5px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="rgba(252,242,246,0.38)"
                        whiteSpace="nowrap"
                    >
                        {section.towerLabel}
                    </Text>
                    <Box
                        position="relative"
                        w={{ base: '32px', md: '44px' }}
                        h={`${section.towerHeight}px`}
                        borderRadius="3px 3px 0 0"
                        border="1px solid"
                        borderColor="rgba(252,242,246,0.16)"
                        borderBottom="0"
                        bg="rgba(252,242,246,0.06)"
                        overflow="hidden"
                    >
                        {done[index] && (
                            <Box
                                position="absolute"
                                inset={0}
                                bgGradient="linear(180deg, rgba(92,225,230,0.75) 0%, rgba(92,225,230,0.25) 100%)"
                                boxShadow="0 0 18px rgba(92,225,230,0.6)"
                            />
                        )}
                    </Box>
                </VStack>
            ))}
        </Flex>
    </Box>
);

export default SkylineProgress;
