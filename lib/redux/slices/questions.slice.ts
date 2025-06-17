import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  totalPages: 0,
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload;
    },
  },
});

export default questionsSlice.reducer;
export const { setQuestions, setTotalPages } = questionsSlice.actions;