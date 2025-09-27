import { createSlice } from "@reduxjs/toolkit";

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {},
  reducers: {
    markAttendance: (state, action) => {
      const { date, student } = action.payload;

      if (!state[date]) {
        state[date] = [];
      }

      const exists = state[date].find((s) => s.rollNo === student.rollNo);
      if (!exists) {
        // Add student with "sent: false"
        state[date].push({ ...student, sent: false });
        localStorage.setItem(`attendance_${date}`, JSON.stringify(state[date]));
      }
    },

    loadAttendance: (state) => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("attendance_")) {
          const date = key.replace("attendance_", "");
          state[date] = JSON.parse(localStorage.getItem(key));
        }
      }
    },

    markAsSent: (state, action) => {
      const { date, rollNo } = action.payload;
      const student = state[date]?.find((s) => s.rollNo === rollNo);
      if (student) {
        student.sent = true;
        localStorage.setItem(`attendance_${date}`, JSON.stringify(state[date]));
      }
    },
  },
});

export const { markAttendance, loadAttendance, markAsSent } =
  attendanceSlice.actions;
export default attendanceSlice.reducer;
