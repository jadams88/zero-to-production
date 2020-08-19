import Cookies from 'cookies';

const MILLI_IN_YEAR = 31536000000;
// 1000 * 60 * 60 * 24 * 365;

export function setRefreshTokenCookie(cookies: Cookies, refreshToken: string) {
  cookies.set('refresh_token', refreshToken, {
    maxAge: MILLI_IN_YEAR,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/authorize/refresh',
  });
}
