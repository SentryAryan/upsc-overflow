import { createSlice } from "@reduxjs/toolkit";
import { QuestionCardProps } from "@/app/page";

export interface initialStateType {
  questions: QuestionCardProps[] | [];
  totalPages: number;
}

const initialState: initialStateType = {
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
