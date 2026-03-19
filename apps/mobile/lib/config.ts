import Constants from 'expo-constants';

const appConfig = Constants.expoConfig?.extra ?? {};
const appEnv = appConfig.env || process.env.ENV || process.env.VITE_ENV || 'PRODUCTION';
const fallbackApiUrl =
  appEnv === 'DEVELOPMENT' ? 'http://localhost:3000' : 'https://api.reflectionsprojections.org';

export const OAUTH_CONFIG = {
  IOS_GOOGLE_CLIENT_ID:
    appConfig.googleClientId || process.env.OAUTH_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  REDIRECT_SCHEME: 'com.googleusercontent.apps.693438449476-tmppq76n7cauru3l0gvk32mufrd7eoq0',
  REDIRECT_PATH: '/(auth)/callback',
};

export const API_CONFIG = {
  BASE_URL: appConfig.apiUrl || process.env.API_URL || fallbackApiUrl,
  TIMEOUT: 10000,
};

export function validateEnvironment() {
  const requiredVars = ['OAUTH_GOOGLE_CLIENT_ID'];

  const missing = requiredVars.filter((varName) => {
    const value = appConfig[varName.toLowerCase()] || process.env[varName];
    return !value || value === `YOUR_${varName}`;
  });

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('Please check your .env file and ensure all required variables are set.');
    return false;
  }

  return true;
}
