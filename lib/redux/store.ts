import { configureStore } from "@reduxjs/toolkit";
import questionsReducer from "./slices/questions.slice";
import filterSubjectsReducer from "./slices/filterSubjects.slice";

const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filterSubjects: filterSubjectsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
