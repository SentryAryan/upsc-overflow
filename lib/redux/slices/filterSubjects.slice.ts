import { createSlice } from "@reduxjs/toolkit";

export interface initialStateType {
  availableSubjects: string[] | [];
  selectedSubject: string | null;
}

const initialState: initialStateType = {
  availableSubjects: [],
  selectedSubject: null,
};

const filterSubjectsSlice = createSlice({
  name: "filterSubjects",
  initialState,
  reducers: {
    setAvailableSubjects: (state, action) => {
      state.availableSubjects = action.payload;
    },
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },
  },
});

export const { setAvailableSubjects, setSelectedSubject } =
  filterSubjectsSlice.actions;
export default filterSubjectsSlice.reducer;
