import type { ThemeConfig } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

export const customTheme = extendTheme({
    config,
    fonts: {
        heading: "'Anonymous Pro', monospace",
        body: "'Anonymous Pro', monospace",
        menu: "'Raleway', monospace",
    },
    textStyles: {
        menu: {
            fontFamily: 'menu',
            fontSize: '18px',
            textColor: 'black',
            fontWeight: '700',
            textUnderlineOffset: '5px',
        },
        textBlock: {
            fontFamily: 'menu',
            fontSize: '65px',
            textColor: 'black',
            fontWeight: '700',
            textUnderlineOffset: '5px',
        },
    },
    colors: {
        brand: {
            100: '#0F1130',
        },
    },
    components: {
        Checkbox: {
            baseStyle: {
                control: {
                    height: '20px',
                    width: '20px',
                },
            },
        },
    },
});
