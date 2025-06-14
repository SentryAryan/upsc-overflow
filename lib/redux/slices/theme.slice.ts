import { createSlice } from '@reduxjs/toolkit'

interface ThemeState {
  isDarkMode: boolean
}

const initialState: ThemeState = {
  isDarkMode: true // Default to dark mode
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload
    }
  }
})

export const { toggleDarkMode, setDarkMode } = themeSlice.actions
export default themeSlice.reducer
