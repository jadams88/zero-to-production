import jsonwebtoken from 'jsonwebtoken';
import omit from 'lodash.omit';
import config from '../config';
import { User } from '@workspace/shared/data';

const { sign } = jsonwebtoken;

// A function that returns a singed JWT
export function signAccessToken(user: User): string {
  return sign(
    {
      // Enter additional payload info here
      role: user.role
    },
    config.secrets.accessToken,
    {
      subject: user.id.toString(),
      expiresIn: config.expireTime,
      issuer: 'your-company-here'
    }
  );
}

export function signRefreshToken(user: User) {
  return sign(
    {
      prop: 'some property'
    },
    config.secrets.refreshToken,
    {
      subject: user.id.toString(),
      issuer: 'your-company-here'
    }
  );
}

export function userToJSON(user: User): User {
  return omit(user, ['hashedPassword', 'password']);
}

export function isPasswordAllowed(password: string): boolean {
  return (
    !!password &&
    password.length > 6 &&
    /\d/.test(password) &&
    /\D/.test(password)
  );
}
