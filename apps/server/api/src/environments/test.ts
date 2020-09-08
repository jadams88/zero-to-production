/* istanbul ignore file */

import { TestServerConfig } from '@ztp/data';
import { AuthEnv } from '@ztp/server/auth';

const audience = 'http://localhost:3000';
const authServerHost = audience;

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAXf+ZATlbBu+O
ChRfX/cqoVriPMOu1MVLGEjYG3MBT5vtNOV4mpT4ZdbsSeeoVHaNhm2pi1Z5Wpsy
x52tryfv1OuB9opieSDelxwnImaw9NZwefo3T+kJtguuzqZpi564jgq+q5vU2zb+
JPVthbDT86nxfqvJ+26uTnVATX3FkFDCEyku8UixWWD43ZRv89PUbadbMs66+fh5
mPTMCFoCp+48Pck7QRUYagZKmRPPONIt9lFNBEVChnlPvAXJfxBGZzRfvr+v8alH
ORD3EHpbSq/Oo8uE4cplYm1MFsF1/3/kpK0aHegiKMJjWXOmvIk/nSyzpcllSkSR
etzJCYQtAgMBAAECggEAE9zg2nyc3oBN1f3Gcr6m99jnWHrrva6snH9qbh4PdvAw
aoLOuvBDN47UbVuINwJZp21c/2eqyycG5WxlJJz0Y7g5hRbe3SIiubkiqAvOTLFL
PxvpMTLoHh+U/zzJRBatkeLgyyVPFuB3wjAww1lNk+USBCSPOnDi0c66HqShuvdo
+qFrV3TWk/SlUGqUsKMSGXPH8RmG/KFM3oqEEx6dW1dddK39VCyzKxC5y0RsKjga
E5vm2jwgEi335i/L72zf7ASpOWBb4qJcwH5Rokpi3iyYyct9vf2k537w718R7ScV
gVC8/XZR/GQagfIfhV0iQn5JIY5jUF5hwuWHo85mxQKBgQDgWHdv+pKlOE2PuPkR
trlE3LUV1dgcCEGbN27+pnVLJHjs+RvNL6Xu2DXcty7fagSqlU378PTRkVUh9ZJI
2X5S+KGXHqVfcrpQ7mhoVIGNdpZCGGOuFKmseidsyeTkIlHPvGBznIcOaTT9HRov
ruGKud8LtLP5VjH57P2f3p745wKBgQDbgnKtohJe5MeF2cqrFKL7JL50gmLAsIPf
0Wn8SgRhdDFR/bwH16Aq/Q7xPwtYzU23jYlBy8ZtXOeRh6Wg+OZ4y+pDVFU20JhU
CimYARipJ8LOPaxxEE3MPLk5/9SGa+PC1J0dc1NOSiSTcxcluRuCfWY5hCBszPDK
nPMsclcTywKBgQDPK+Lf3Z0eRegaGM6otPxRwx7WkyuGd3leRMqTDlSyl3O0Ijay
PJYXAkJ7GA6I8fZtMINbbSAnhvX+7i+wZmhpZoCSdRJyGhhENGTmM2OPpzsKvksO
rrYhOIy/wZFFuwuhsmu/V4TAohb0xrMv5WcSHKMExFKOpjJwgZGU2JglcQKBgH4w
SJKuqBbrOBQnds3QyDzOC7rYtcKF9tm0/lOtjUUk0bGLxwtPFuF/ppZjIrfDFlld
wTkU1xZJoUnVDA805vEscJiSI4amddtiGDUs9CtSEzgS1k4NDFxL0EOaYWeBIGcB
aOzkPlC0aMBnGjhyaHEke5626RkC263uehDkDlDvAoGBALDCWKZQMLrY0NocI1cq
6ivKB2+5jieV5mugZQwqzGydd3IiGrUQCWs2SXC7V7M7lh3sEl0EOitlHM7kBe2B
fb4sRct651qUxYPtLnYo2Gp7cioe+bZVNsKmKATW95Ipg+5TlJT1cKLGWh3gVV5Q
1ZM4kO9FKoV3dL8obhcl2vi5
-----END PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwF3/mQE5WwbvjgoUX1/3
KqFa4jzDrtTFSxhI2BtzAU+b7TTleJqU+GXW7EnnqFR2jYZtqYtWeVqbMsedra8n
79TrgfaKYnkg3pccJyJmsPTWcHn6N0/pCbYLrs6maYueuI4Kvqub1Ns2/iT1bYWw
0/Op8X6ryfturk51QE19xZBQwhMpLvFIsVlg+N2Ub/PT1G2nWzLOuvn4eZj0zAha
AqfuPD3JO0EVGGoGSpkTzzjSLfZRTQRFQoZ5T7wFyX8QRmc0X76/r/GpRzkQ9xB6
W0qvzqPLhOHKZWJtTBbBdf9/5KStGh3oIijCY1lzpryJP50ss6XJZUpEkXrcyQmE
LQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * Test environment settings
 */
export const testConfig: TestServerConfig = {
  production: false,
  dbConnectionString: '', // These e2e test use mongodb-in-memory server, so the url is passed into 'init server' per test
  databaseOptions: {
    loggerLevel: 'warn',
    dbName: 'test_database',
  },
};

export const testAuthConfig: AuthEnv = {
  jwksRoute: true,
  authServerHost,
  accessToken: {
    privateKey,
    publicKey,
    expireTime: 86400,
    issuer: 'ISSUER',
    audience,
  },
  refreshToken: {
    secret: 'test_refresh_token_secret',
    issuer: 'ISSUER',
    audience,
  },
};
