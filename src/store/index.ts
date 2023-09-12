import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import user, { statusApi } from './user';

const reducer = combineReducers({
  user,
  [statusApi.reducerPath]: statusApi.reducer,
});

const middleware = getDefaultMiddleware({ serializableCheck: false }).concat(statusApi.middleware);

export const store = configureStore({ reducer, middleware });

export type RootState = ReturnType<typeof reducer>;
