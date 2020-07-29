const POLICY =
  "connect-src 'self'; " + // delete
  "manifest-src 'self'; " +
  "default-src 'none'; " +
  "script-src 'self' cdnjs.cloudflare.com; " +
  "img-src 'self'; " +
  "style-src 'self' 'nonce-abd123' cdnjs.cloudflare.com cdnjs.cloudflare.com;" +
  "style-src-elem 'self' 'nonce-abd123' fonts.googleapis.com cdnjs.cloudflare.com;" +
  'font-src fonts.gstatic.com';

//   'default-src': ["'self'"],
//         'script-src': [
//           `'self'`,
//           'cdnjs.cloudflare.com',
//           `'nonce-${res.locals.nonce}'`,
//         ],
//         'img-src': [`'self'`],
//         'style-src': [
//           `'self'`,
//           'fonts.googleapis.com',
//           'cdnjs.cloudflare.com',
//           `'nonce-abd123'`,
//         ],
//         'style-src-elem': [
//           `'self'`,
//           'fonts.googleapis.com',
//           'cdnjs.cloudflare.com',
//           `'nonce-abd123'`,
//         ],
//         'font-src': ['fonts.gstatic.com'],
// 'upgrade-insecure-requests': [],

const PROXY_CONFIG = {
  '/': {
    secure: false,
    bypass: (req, res, proxyOptions) => {
      res.setHeader('Content-Security-Policy', POLICY);
    },
  },
};

module.exports = PROXY_CONFIG;
