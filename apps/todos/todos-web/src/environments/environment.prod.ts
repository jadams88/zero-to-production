// ZTP_AFTER_CLONE -> change the url to point to your own API server
const serverUrl = 'https://api.zero-to-production.dev';

export const environment = {
  production: true,
  serverUrl,
  apiBaseUrl: `${serverUrl}/api`,
  graphQLUrl: `${serverUrl}/graphql`,
};
