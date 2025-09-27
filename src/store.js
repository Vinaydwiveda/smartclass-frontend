import { configureStore } from '@reduxjs/toolkit';
import attendanceReducer from './features/attendanceSlice';

export const store = configureStore({
  reducer: {
    attendance: attendanceReducer,
  },
});
