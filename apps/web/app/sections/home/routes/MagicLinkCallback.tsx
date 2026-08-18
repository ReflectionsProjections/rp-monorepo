import { Button, Link, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '@app';
import { readJwtClaims, takeMagicLinkReturnTo } from '@api/auth';
import { AuthCard, BODY_FONT, TEXT_COLOR } from '@app/sections/home/components/Auth/AuthCard';

type VerifyState = 'confirming' | 'verifying' | 'success' | 'error';

const MISSING_TOKEN_MESSAGE = 'This link is missing its token. Please request a new one.';

function tokenFromQuery() {
    return new URLSearchParams(window.location.search).get('token');
}

function stripTokenFromQuery() {
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

type MagicLinkCallbackProps = {
    /**
     * Where a fully registered account lands. An account that still has no roles
     * is sent to registration regardless, since that is all a setup token allows.
     */
    destination: string;
};

export function MagicLinkCallback({ destination }: MagicLinkCallbackProps) {
    const [token] = useState(tokenFromQuery);
    const [state, setState] = useState<VerifyState>(token ? 'confirming' : 'error');
    const [errorMessage, setErrorMessage] = useState(token ? '' : MISSING_TOKEN_MESSAGE);

    const verified = useRef(false);
    const redirectTarget = useRef<string | null>(null);

    useEffect(() => {
        if (token) {
            // Keep the state initializer pure so React.StrictMode can call it twice
            // without the second call losing the token.
            stripTokenFromQuery();
        }
    }, [token]);

    const handleConfirm = () => {
        // A deliberate click keeps email security scanners from consuming this
        // single-use token merely by loading the page.
        if (!token || verified.current) {
            return;
        }
        verified.current = true;
        setState('verifying');

        api.post('/auth/magic-links/verify', { token, client: 'web' })
            .then((response) => {
                const jwt = response.data.token;
                localStorage.setItem('jwt', jwt);

                const claims = readJwtClaims(jwt);
                // A roleless account can only register, wherever it was headed.
                const next =
                    claims?.tokenType === 'setup'
                        ? '/register'
                        : (takeMagicLinkReturnTo() ?? destination);
                redirectTarget.current = next;
                setState('success');
            })
            .catch((err) => {
                setState('error');
                verified.current = false;
                if (axios.isAxiosError(err) && err.response?.status === 429) {
                    setErrorMessage('Too many attempts. Please wait a few minutes and try again.');
                } else {
                    setErrorMessage(
                        'This link is invalid, expired, or already used. Please request a new one.',
                    );
                }
            });
    };

    useEffect(() => {
        if (state !== 'success' || redirectTarget.current === null) {
            return;
        }

        // A full load rather than a client-side navigation, so the route guards
        // re-read the JWT that was just stored.
        const redirectTimer = setTimeout(() => {
            window.location.replace(redirectTarget.current!);
        }, 800);

        return () => clearTimeout(redirectTimer);
    }, [state]);

    return (
        <AuthCard
            title={
                state === 'error'
                    ? 'Sign in failed'
                    : state === 'confirming'
                      ? 'Confirm sign-in'
                      : 'Signing you in'
            }
        >
            {state === 'confirming' && (
                <>
                    <Text fontFamily={BODY_FONT} fontWeight={500} color={TEXT_COLOR} opacity={0.85}>
                        Click below to finish signing in or registering.
                    </Text>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        w="100%"
                        borderRadius="full"
                        fontFamily={BODY_FONT}
                        fontWeight={500}
                        color="#FFFFFF"
                        bg="rgba(192,38,211,0.85)"
                        _hover={{ bg: 'rgba(192,38,211,1)' }}
                        _active={{ bg: 'rgba(160,30,180,1)' }}
                    >
                        Continue
                    </Button>
                </>
            )}

            {state === 'verifying' && (
                <>
                    <Spinner size="lg" color="#FCF2F6" thickness="3px" speed="0.8s" />
                    <Text fontFamily={BODY_FONT} fontWeight={500} color={TEXT_COLOR} opacity={0.85}>
                        Verifying your link…
                    </Text>
                </>
            )}

            {state === 'success' && (
                <Text fontFamily={BODY_FONT} fontWeight={500} color={TEXT_COLOR} opacity={0.85}>
                    You&rsquo;re in. Taking you there now…
                </Text>
            )}

            {state === 'error' && (
                <>
                    <Text fontFamily={BODY_FONT} fontWeight={500} color={TEXT_COLOR} opacity={0.85}>
                        {errorMessage}
                    </Text>
                    <Link
                        href="/login"
                        fontFamily={BODY_FONT}
                        fontWeight={500}
                        color="#FCF2F6"
                        textDecoration="underline"
                        textUnderlineOffset="4px"
                        _hover={{ opacity: 0.75 }}
                    >
                        Request a new link
                    </Link>
                </>
            )}
        </AuthCard>
    );
}
