import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const questionUpdateSlice = createSlice({
  name: "questionUpdate",
  initialState,
  reducers: {
    setQuestionUpdate: (state, action) => {
      return action.payload;
    },
  },
});

export const { setQuestionUpdate } = questionUpdateSlice.actions;
export default questionUpdateSlice.reducer;