import { createSlice } from "@reduxjs/toolkit";
import { TestTypeSchema } from "@/db/models/test.model";

export interface initialStateType {
  test: TestTypeSchema | null;
}

const initialState: initialStateType = {
  test: null,
};

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    setTest: (state, action) => {
      state.test = action.payload;
    },
  },
});

export const { setTest } = testSlice.actions;
export default testSlice.reducer;
