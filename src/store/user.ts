import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'firebaseDB';

type State = {
  userId: string;
  memberList: string[];
  drawResult?: string;
};

const initialState: State = {
  userId: '',
  memberList: [],
};

type EntriesResponse = {
  memberList: string[];
};

type DrawResultResponse = {
  userId?: string;
};

// RTK Queryの設定
// https://redux-toolkit.js.org/rtk-query/overview
type FirebaseBaseQueryParams = {
  path: string;
};
const firebaseBaseQuery = async ({ path }: FirebaseBaseQueryParams) => {
  const docRef = doc(db, 'status', path);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { data: docSnap.data() };
  } else {
    return { error: 'No such document!' };
  }
};

export const statusApi = createApi({
  reducerPath: 'statusApi',
  baseQuery: firebaseBaseQuery,
  endpoints: builder => ({
    getEntries: builder.query<EntriesResponse, void>({
      query: () => ({ path: 'room_entries' }),
    }),
    getDrawResult: builder.query<DrawResultResponse, void>({
      query: () => ({ path: 'draw_result' }),
    }),
  }),
});

export const { useGetEntriesQuery, useGetDrawResultQuery } = statusApi;

const user = createSlice({
  name: 'user',

  initialState,

  reducers: {
    updateUserId: (state, action) => {
      state.userId = action.payload;
    },
  },

  extraReducers: builder => {
    builder.addMatcher(
      statusApi.endpoints.getEntries.matchFulfilled,
      (state, action: PayloadAction<EntriesResponse>) => {
        state.memberList = action.payload.memberList;
      }
    );
    builder.addMatcher(
      statusApi.endpoints.getDrawResult.matchFulfilled,
      (state, action: PayloadAction<DrawResultResponse>) => {
        state.drawResult = action.payload.userId;
      }
    );
  },
});

// Action Creators
export const { updateUserId } = user.actions;

// Reducer
export default user.reducer;
