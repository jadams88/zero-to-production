import { ActionReducerMap } from '@ngrx/store';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';

// The interface of the AppState
export interface AppState {
  router: RouterReducerState<any>;
}

export const appReducerMap: ActionReducerMap<AppState> = {
  router: routerReducer,
};
