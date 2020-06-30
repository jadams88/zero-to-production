import { Injectable, InjectionToken, Inject, PLATFORM_ID } from '@angular/core';
import gql from 'graphql-tag';
import { GraphQLService } from '@ztp/common/data-access';
import { IUser } from '@ztp/data';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
  IJWTPayload,
} from '../auth.interface';
import { secondsToExpiresAtMillis } from '../utils';
import { AuthFacade } from '../+state/auth.facade';
import { isPlatformBrowser } from '@angular/common';

function jwtDecode<T>(token: string | null | undefined): T | any {
  if (token) {
    try {
      // second index is the body
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      // ignore
    }
  } else {
    return null;
  }
}

export const AUTH_SERVER_URL = new InjectionToken<string>(
  'forRoot() Auth Server Url'
);

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly storageKey = 'access_token';
  readonly sessionKey = 'expires_at';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private graphQl: GraphQLService,
    private facade: AuthFacade
  ) {}

  // Login function that returns a user and JWT
  // This is a graphql login function
  login(credentials: ILoginCredentials) {
    const mutation = gql`
      mutation LoginUser($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          expiresIn
        }
      }
    `;
    return this.graphQl.mutate<{ login: ILoginResponse }>({
      mutation,
      variables: credentials,
    });
  }

  register(details: IRegistrationDetails) {
    const mutation = gql`
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          id
        }
      }
    `;
    return this.graphQl.mutate<{ register: IUser }>({
      mutation,
      variables: {
        input: details,
      },
    });
  }

  loadUser(id: string) {
    const query = gql`
      query AuthUser($id: ID!) {
        User(id: $id) {
          id
          givenName
          surname
          email
          dateOfBirth
        }
      }
    `;

    return this.graphQl.query<{ User: IUser }>({ query, variables: { id } });
  }

  public isUserAvailable(username: string) {
    const query = gql`
      query IsUserAvailable($username: String!) {
        userAvailable(username: $username) {
          isAvailable
        }
      }
    `;

    return this.graphQl.query<{ userAvailable: { isAvailable: boolean } }>({
      query,
      variables: { username },
    });
  }

  get authToken(): string | null | undefined {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.storageKey);
    }
  }

  setSession({ token, expiresIn }: ILoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      const expiresAt = secondsToExpiresAtMillis(expiresIn);
      localStorage.setItem(this.storageKey, token);
      localStorage.setItem(this.sessionKey, expiresAt.toString());
    }
  }

  removeSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.sessionKey);
    }
  }

  /**
   *
   * NOTE: Side Effect. Each time the isLoggedIn methods is called, it will synchronously update the redux store
   *
   * @memberof AuthService
   */
  public isLoggedIn(): void {
    if (isPlatformBrowser(this.platformId)) {
      const expiration = this.expiration;
      const auth = expiration ? this.isAuthenticated(expiration) : false;

      if (auth) {
        this.facade.setAuthenticated(true, expiration);
      } else {
        this.removeSession();
        this.facade.setAuthenticated(false, null);
      }
    }
  }

  private get expiration(): number | null {
    const expiration: string | null = localStorage.getItem(this.sessionKey);
    return expiration ? Number(expiration) : null;
  }

  private isAuthenticated(expiration: number): boolean {
    return new Date().valueOf() < expiration;
  }

  get authUserId(): string | null {
    const token = this.authToken;
    return token !== null ? jwtDecode<IJWTPayload>(token).sub : null;
  }
}

export function authProviderFactory(service: AuthService) {
  return () => service.isLoggedIn();
}
