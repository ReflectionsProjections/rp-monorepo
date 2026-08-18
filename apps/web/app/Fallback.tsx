import { motion } from 'framer-motion';

export default function Fallback() {
    return (
        <div
            style={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(1rem, 4vw, 2rem)',
                boxSizing: 'border-box',
            }}
        >
            <motion.img
                src="/rp_logo.svg"
                alt="Reflections Projections logo"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 2.4,
                    ease: 'linear',
                    repeat: Infinity,
                }}
                style={{
                    width: 'min(28vw, 10rem)',
                    minWidth: '4.5rem',
                    maxWidth: '10rem',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    display: 'block',
                }}
            />
        </div>
    );
}
