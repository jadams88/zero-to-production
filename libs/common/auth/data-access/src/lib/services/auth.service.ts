import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from '@ztp/data';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
  IJWTPayload,
} from '../auth.interface';
import { AuthFacade } from '../+state/auth.facade';
import { jwtDecode } from './jwt-decode';
import { AUTH_SERVER_URL } from '../tokens/tokens';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

interface GQLSuccess<T> {
  data: T;
  errors: [];
}
interface GQLError {
  data: null;
  errors: any[];
}
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
    @Inject(AUTH_SERVER_URL) private serverUrl: string,
    private http: HttpClient,
    private facade: AuthFacade,
    @Inject(DOCUMENT) private document: Document
  ) {}

  // Login function that returns a JWT
  // This is a graphql login function
  login(credentials: ILoginCredentials) {
    const query = `
      mutation Authorize($username: String!, $password: String!) {
        authorize(username: $username, password: $password) {
          token
          expiresIn
        }
      }
    `;

    const data = {
      query,
      operationName: 'Authorize',
      variables: credentials,
    };

    return this.http.post<GQLResponse<{ authorize: ILoginResponse }>>(
      `${this.serverUrl}/graphql`,
      data,
      {
        headers: this.headers,
        reportProgress: false,
        withCredentials: true,
      }
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
      data,
      {
        headers: this.headers,
        reportProgress: false,
      }
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
      data,
      {
        headers: this.headers,
        reportProgress: false,
      }
    );
  }

  refreshAccessToken() {
    return this.http.post<
      { token: string; expiresIn: number } | { token: null; expiresIn: null }
    >(
      `${this.serverUrl}/authorize/refresh`,
      {},
      {
        headers: this.headers,
        reportProgress: false,
        withCredentials: true,
      }
    );
  }

  revokeRefreshToken() {
    return this.http.post<{ success: boolean }>(
      `${this.serverUrl}/authorize/revoke`,
      {},
      {
        headers: this.headers,
        reportProgress: false,
        withCredentials: true,
      }
    );
  }

  public isLoggedIn() {
    const originalUrl = this.document.location.pathname;
    this.facade.isLoggedIn(originalUrl);
  }

  isAuthenticated(expiration: number): boolean {
    return new Date().valueOf() < expiration;
  }

  decodeToken(token: string | null) {
    return token !== null ? jwtDecode<IJWTPayload>(token).sub : null;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }
}

export function authProviderFactory(service: AuthService) {
  return () => service.isLoggedIn();
}
