import { Box, Image, Text } from '@chakra-ui/react';
import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

const useMarqueeSpeed = () => {
    const [speed, setSpeed] = useState(60);

    useEffect(() => {
        const updateSpeed = () => {
            const vh = window.innerHeight / 100;
            setSpeed(vh * 5); // Adjust speed relative to viewport height
        };

        updateSpeed();
        window.addEventListener('resize', updateSpeed);
        return () => window.removeEventListener('resize', updateSpeed);
    }, []);

    return speed;
};

const SPONSORS: {
    name: string;
    logo: string;
    height?: string;
}[] = [
    {
        name: 'Aechelon',
        logo: '/site/sponsors/car_images/aechelon.png',
        height: '6vh',
    },
    {
        name: 'Capital One',
        logo: '/site/sponsors/car_images/capitalone.png',
        height: '4vh',
    },
    {
        name: 'Caterpillar',
        logo: '/site/sponsors/car_images/caterpillar.svg',
        height: '2.5vh',
    },
    {
        name: 'Cloudflare',
        logo: '/site/sponsors/car_images/cloudflare.png',
        height: '4vh',
    },
    {
        name: 'John Deere',
        logo: '/site/sponsors/car_images/deere.png',
        height: '6vh',
    },
    {
        name: 'Everfox',
        logo: '/site/sponsors/car_images/everfox.svg',
        height: '4.5vh',
    },
    {
        name: 'Hudson River Trading',
        logo: '/site/sponsors/car_images/hrt.svg',
        height: '4vh',
    },
    {
        name: 'Jane Street',
        logo: '/site/sponsors/car_images/janestreet.png',
        height: '4vh',
    },
    { name: 'Magna', logo: '/site/sponsors/car_images/magna.svg', height: '3vh' },
    {
        name: 'OpenAI',
        logo: '/site/sponsors/car_images/openai.svg',
        height: '3vh',
    },
    {
        name: 'State Farm',
        logo: '/site/sponsors/car_images/statefarm.png',
        height: '2.5vh',
    },
    {
        name: 'Qualcomm',
        logo: '/site/sponsors/car_images/qualcomm.png',
        height: '3vh',
    },
];

export const Sponsors = () => {
    const speed = useMarqueeSpeed();

    return (
        <Box position="relative" display={'flex'} flexDir={'column'}>
            <Text
                fontSize="3vh"
                fontWeight="bold"
                textAlign="center"
                fontFamily="ProRacingSlant"
                marginBottom="1.5vh"
            >
                Sponsors
            </Text>
            <Box
                borderRadius={'1vh'}
                boxShadow="0 0.4vh 3.2vh rgba(0,0,0,0.10)"
                bgColor={'rgba(0,0,0,0.2)'}
                px="0.5vh"
                py="2.5vh"
                sx={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                }}
            >
                <Marquee
                    gradient={false}
                    speed={speed}
                    style={{
                        background: 'transparent',
                        maskImage:
                            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                        WebkitMaskImage:
                            'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                    }}
                >
                    {SPONSORS.map((s, i) => (
                        <Box key={i} mx="3vh" display="flex" alignItems="center">
                            <Image
                                src={s.logo}
                                alt={s.name}
                                h={s.height ?? '3vh'}
                                objectFit="contain"
                                mr="1vh"
                                filter="brightness(0.92)"
                                style={{
                                    filter: 'brightness(0.92) drop-shadow(0 0 6px rgba(255,255,255,0.08))',
                                }}
                            />
                        </Box>
                    ))}
                </Marquee>
            </Box>
        </Box>
    );
};
