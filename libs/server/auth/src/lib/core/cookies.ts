import Cookies, { SetOption } from 'cookies';

const options: SetOption = {
  maxAge: 31536000000, // 1000 * 60 * 60 * 24 * 365
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/authorize/refresh',
};

export function setRefreshTokenCookie(cookies: Cookies, refreshToken?: string) {
  if (refreshToken) {
    cookies.set('refresh_token', refreshToken, options);
  } else {
    cookies.set('refresh_token');
  }
}
