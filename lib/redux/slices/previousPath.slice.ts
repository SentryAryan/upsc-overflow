import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  previousPath: null,
  previousSubject: null,
  previousTag: null,
  previousQuestion: null,
  previousSortBy: null,
  previousPage: 0,
};

const previousPathSlice = createSlice({
  name: "previousPath",
  initialState,
  reducers: {
    setPreviousPath: (state, action) => {
      state.previousPath = action.payload;
    },
    setPreviousSubject: (state, action) => {
      state.previousSubject = action.payload;
    },
    setPreviousTag: (state, action) => {
      state.previousTag = action.payload;
    },
    setPreviousQuestion: (state, action) => {
      state.previousQuestion = action.payload;
    },
    setPreviousSortBy: (state, action) => {
      state.previousSortBy = action.payload;
    },
    setPreviousPage: (state, action) => {
      state.previousPage = action.payload;
    },
  },
});

export const {
  setPreviousPath,
  setPreviousSubject,
  setPreviousTag,
  setPreviousQuestion,
  setPreviousSortBy,
  setPreviousPage,
} = previousPathSlice.actions;
export default previousPathSlice.reducer;
