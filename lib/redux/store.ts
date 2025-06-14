import { configureStore } from "@reduxjs/toolkit";
import questionsReducer from "./slices/questions.slice";
import filterSubjectsReducer from "./slices/filterSubjects.slice";
import themeReducer from "./slices/theme.slice";

const store = configureStore({
  reducer: {
    questions: questionsReducer,
    filterSubjects: filterSubjectsReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
