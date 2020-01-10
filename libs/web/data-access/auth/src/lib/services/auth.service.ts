import { Injectable, InjectionToken, Inject } from '@angular/core';
import { Observable } from 'rxjs';
// @ts-ignore
import jwtDecode from 'jwt-decode';
import { GraphQLService } from '@uqt/data-access/api';
import { IUser } from '@uqt/interfaces';
import {
  ILoginCredentials,
  ILoginResponse,
  IRegistrationDetails,
  IJWTPayload
} from '../auth.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export const AUTH_SERVER_URL = new InjectionToken<string>(
  'forRoot() Auth Server Url'
);

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly storageKey = 'access_token';
  constructor(
    @Inject(AUTH_SERVER_URL) private authServerUrl: string,
    private graphQL: GraphQLService,
    private http: HttpClient
  ) {}

  // Login function that returns a user and JWT
  // This is a graphql login function
  login(credentials: ILoginCredentials) {
    const query = `
      mutation LoginUser($username: String!, $password: String!){
        login(username: $username, password: $password){
          token
          expiresIn
        }
      }
    `;
    return this.graphQL.mutation<{ login: ILoginResponse }>(query, credentials);
  }

  // swap out for a REST login function
  // login(credentials: LoginCredentials): Observable<LoginResponse> {
  //   return this.http.post<LoginResponse>(`${environment.serverUrl}/authorize`, credentials);
  // }

  register(details: IRegistrationDetails) {
    const query = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          id
        }
      }
    `;
    return this.graphQL.mutation<{ register: IUser }>(query, {
      input: details
    });
  }

  // TODO -> Graphql?

  public isUsernameAvailable(
    username: string
  ): Observable<{ isAvailable: boolean }> {
    return this.http.get<{ isAvailable: boolean }>(
      `${this.authServerUrl}/authorize/available`,
      {
        headers: this.headers,
        params: { username }
      }
    );
  }

  setAuthorizationToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  get authorizationToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  // Checks if the user is logged in
  checkUserIsLoggedIn(): boolean {
    const token = this.authorizationToken;
    return token && this.checkTokenIsValid(token) ? true : false;
  }

  removeAuthorizationToken(): void {
    localStorage.removeItem(this.storageKey);
  }

  private decodeToken(token: string): IJWTPayload {
    return jwtDecode<IJWTPayload>(token);
  }

  // get decodedToken(): IJWTPayload | undefined {
  //   const token = this.getAuthorizationToken();
  //   if (token !== null) {
  //     return this.decodeToken(token);
  //   }
  // }

  checkTokenIsValid(token: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    const expTime: number = this.decodeToken(token).exp;
    return now < expTime ? true : false;
  }

  get headers(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    return new HttpHeaders(headersConfig);
  }
}
