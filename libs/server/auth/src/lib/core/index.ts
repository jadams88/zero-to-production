export { signAccessToken, signRefreshToken, verifyToken } from './tokens';

export {
  setupAuthorizeController,
  setupLoginController,
  setupRefreshAccessTokenController,
  setupRegisterController,
  setupRevokeRefreshTokenController,
  setupUserAvailableController,
  setupVerifyController,
  simpleRegistration,
} from './controllers';

export {
  includeEmailVerification,
  includeRefresh,
  isJWKS,
  isPasswordAllowed,
  createEmailMessage,
  createPublicPemFromPrivate,
  stripPasswordFields,
} from './utils';

export { generateAuthGuardConfig, generateAuthModuleConfig } from './config';

export {
  retrievePublicKeyFromJWKS,
  isActiveUser,
  verifyRefresh,
  verifyUserRole,
} from './authenticate';
