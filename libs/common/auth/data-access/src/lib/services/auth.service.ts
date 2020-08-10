import { Injectable, InjectionToken, Inject, PLATFORM_ID } from '@angular/core';
import { IUser } from '@ztp/data';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
  IJWTPayload,
} from '../auth.interface';
import { AuthFacade } from '../+state/auth.facade';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from './jwt-decode';
import { HttpClient } from '@angular/common/http';

export const AUTH_SERVER_URL = new InjectionToken<string>(
  'forRoot() Auth Server Url'
);

type GQLSuccess<T> = { data: T; errors: [] };
type GQLError = { data: null; errors: any[] };
type GQLResponse<T> = GQLSuccess<T> | GQLError;

/**
 * For the auth service, we do not use the GraphQL Service (and consequently ApolloClient)
 * This removes the cache as well as a different auth url can be used thant the 'api' url
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly storageKey = 'access_token';
  readonly sessionKey = 'expires_at';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(AUTH_SERVER_URL) private serverUrl: string,
    private http: HttpClient,
    private facade: AuthFacade
  ) {}

  // Login function that returns a JWT
  // This is a graphql login function
  login(credentials: ILoginCredentials) {
    const query = `
      mutation LoginUser($username: String!, $password: String!) {
        authorize(username: $username, password: $password) {
          token
          expiresIn
        }
      }
    `;

    const data = {
      query,
      operationName: 'LoginUser',
      variables: credentials,
    };

    return this.http.post<GQLResponse<{ authorize: ILoginResponse }>>(
      `${this.serverUrl}/graphql`,
      data
    );
  }

  register(input: IRegistrationDetails) {
    const query = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          id
        }
      }
    `;

    const data = {
      query,
      operationName: 'Register',
      variables: { input },
    };

    return this.http.post<GQLResponse<{ register: IUser }>>(
      `${this.serverUrl}/graphql`,
      data
    );
  }

  loadUser(id: string) {
    const query = `
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

    const data = {
      query,
      operationName: 'AuthUser',
      variables: { id },
    };

    return this.http.post<GQLResponse<{ User: IUser }>>(
      `${this.serverUrl}/graphql`,
      data
    );
  }

  refreshAccessToken() {
    return this.http.post<{ token: string; expiresIn: number }>(
      `${this.serverUrl}/authorize/refresh`,
      {}
    );
  }

  revokeRefreshToken() {
    return this.http.post<{ success: boolean }>(
      `${this.serverUrl}/authorize/revoke`,
      {}
    );
  }

  get authToken(): string | null | undefined {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.storageKey);
    }
  }

  setSession({ token, expiresIn }: ILoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      const expiresAt = new Date().valueOf() + expiresIn * 1000;
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
