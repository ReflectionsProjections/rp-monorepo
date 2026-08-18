import axios from 'axios';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { Role, RoleObject } from '@api/types';
import api from '@api/api';
import { magicLinkSignIn, readJwtClaims } from '@api/auth';

type RequireAuthProps = {
    requiredRoles?: Role[];
};

const NO_REQUIRED_ROLES: Role[] = [];

const RequireAuth: React.FC<RequireAuthProps> = ({ requiredRoles = NO_REQUIRED_ROLES }) => {
    const [authInfo, setAuthInfo] = useState<RoleObject | null>(null);
    const [authCheckFailed, setAuthCheckFailed] = useState(false);
    const jwt = localStorage.getItem('jwt');

    useEffect(() => {
        if (!jwt) {
            magicLinkSignIn();
            return;
        }

        if (!authInfo && !authCheckFailed) {
            api.get('/auth/info')
                .then((response) => {
                    const roles = response.data.roles;

                    const missingRole = requiredRoles.find((role) => !roles.includes(role));
                    if (missingRole) {
                        window.location.href = '/unauthorized';
                    } else {
                        setAuthInfo(response.data);
                    }
                })
                .catch((error: unknown) => {
                    // A setup token is refused here by design: the account exists but has
                    // no roles yet, so registration is the only place it can go. Without
                    // this the page would sit on "Loading..." forever.
                    if (readJwtClaims(jwt)?.tokenType === 'setup') {
                        window.location.href = '/register';
                        return;
                    }
                    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
                    const credentialsRejected =
                        status === 401 || status === 403 || localStorage.getItem('jwt') === null;

                    if (credentialsRejected) {
                        localStorage.removeItem('jwt');
                        magicLinkSignIn();
                        return;
                    }

                    // A network failure, 5xx, or unexpected response does not prove the
                    // credentials are bad. Preserve the session and let the user retry
                    // without exposing response details.
                    setAuthCheckFailed(true);
                });
        }
    }, [authCheckFailed, authInfo, jwt, requiredRoles]);

    if (!jwt) {
        return <p>Redirecting to login...</p>;
    }

    if (authCheckFailed) {
        return (
            <div role="alert">
                <p>We couldn&rsquo;t verify your session. Please try again.</p>
                <button type="button" onClick={() => setAuthCheckFailed(false)}>
                    Try again
                </button>
            </div>
        );
    }

    if (!authInfo) {
        return <p>Loading...</p>;
    }

    return <Outlet context={authInfo} />;
};

export default RequireAuth;
