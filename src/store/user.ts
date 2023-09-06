import { createSlice } from '@reduxjs/toolkit';

type State = {
  score: number;
};

const initialState: State = {
  score: 0,
};

const user = createSlice({
  name: 'user',

  initialState,

  reducers: {
    updateScore: (state, action) => {
      state.score = action.payload;
    },
  },
});

// Action Creators
export const { updateScore } = user.actions;

// Reducer
export default user.reducer;
