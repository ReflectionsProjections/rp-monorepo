import axios from 'axios';
import type { ApiError, TypedAxiosInstance } from './type-wrapper';
import Config from '../constants/config';
import { magicLinkSignIn, readJwtClaims } from './auth';

function holdingSetupToken() {
    const jwt = localStorage.getItem('jwt');
    return jwt !== null && readJwtClaims(jwt)?.tokenType === 'setup';
}

// The API sends the same "InvalidJWT" code both when a route legitimately
// refuses a setup token (expected mid-registration) and when the token itself
// is malformed or corrupt (which would otherwise loop forever, since nothing
// here ever discards it). Without a distinct code from the API, fall back to
// clearing the token after a run of consecutive rejections.
const SETUP_TOKEN_REJECTION_KEY = 'setupTokenInvalidJwtCount';
const MAX_SETUP_TOKEN_REJECTIONS = 5;

function tooManySetupTokenRejections() {
    const count = Number(sessionStorage.getItem(SETUP_TOKEN_REJECTION_KEY)) + 1 || 1;
    sessionStorage.setItem(SETUP_TOKEN_REJECTION_KEY, String(count));
    return count > MAX_SETUP_TOKEN_REJECTIONS;
}

function resetSetupTokenRejections() {
    sessionStorage.removeItem(SETUP_TOKEN_REJECTION_KEY);
}

const axiosObject = axios.create({ baseURL: Config.API_BASE_URL });

axiosObject.interceptors.request.use((config) => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
        config.headers.Authorization = jwt;
    } else {
        config.headers.Authorization = undefined;
    }

    return config;
});

axiosObject.interceptors.response.use(
    (response) => {
        resetSetupTokenRejections();
        return response;
    },
    (error: ApiError) => {
        const errorType = error.response?.data?.error;

        if (errorType === 'NoJWT') {
            localStorage.removeItem('jwt');
            magicLinkSignIn();
            return;
        }

        // RoleChecker validates the payload before it applies its weak-verification
        // bypass, so a setup token is rejected by routes that accept no token at
        // all. That means "this route needs a registered account", not "the session
        // is broken" — discarding the token here would drop a half-finished
        // registration and bounce the user back to the start.
        //
        // The API sends this same code for a genuinely malformed token, though,
        // which this branch can't tell apart from a valid-but-refused setup token.
        // Clear it after enough consecutive rejections so that case isn't a
        // permanent loop.
        if (errorType === 'InvalidJWT' && holdingSetupToken()) {
            if (tooManySetupTokenRejections()) {
                localStorage.removeItem('jwt');
                resetSetupTokenRejections();
                window.location.reload();
                return;
            }
            return Promise.reject(error);
        }

        if (errorType === 'ExpiredJWT' || errorType === 'InvalidJWT') {
            localStorage.removeItem('jwt');
            window.location.reload();
            return;
        }

        console.error('API error:', error);

        return Promise.reject(error);
    },
);

const api: TypedAxiosInstance = {
    get: (url, config) => axiosObject.get(url as string, config),
    post: (url, data, config) => axiosObject.post(url as string, data, config),
    put: (url, data, config) => axiosObject.put(url as string, data, config),
    patch: (url, data, config) => axiosObject.patch(url as string, data, config),
    delete: (url, config) => axiosObject.delete(url as string, config),
};

export default api;
