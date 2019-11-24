import { createReducer, on, Action } from '@ngrx/store';
import * as fromAuth from './auth.actions';
import { AvailableStatus } from '@ngw/enums';

export interface AuthState {
  loggedIn: boolean;
  availability: AvailableStatus | null;
}

export const initialState: AuthState = {
  loggedIn: false,
  availability: null
};

const authReducer = createReducer(
  initialState,
  on(fromAuth.usernamePending, state => {
    return { ...state, availability: AvailableStatus.Pending };
  }),
  on(fromAuth.usernameAvailable, state => {
    return { ...state, availability: AvailableStatus.Available };
  }),
  on(fromAuth.usernameUnAvailable, state => {
    return { ...state, availability: AvailableStatus.UnAvailable };
  }),
  on(fromAuth.clearAvailability, state => {
    return { ...state, availability: null };
  })
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
