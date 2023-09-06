import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import user from './user';

const reducer = combineReducers({
  user,
});

const middleware = getDefaultMiddleware({ serializableCheck: false });
export const store = configureStore({ reducer, middleware });

export type RootState = ReturnType<typeof reducer>;
