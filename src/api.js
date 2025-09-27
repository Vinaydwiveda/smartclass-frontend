import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // use proxy for development
});

export default API;

export const sendAttendanceToN8n = async (details) => {
  try {
    const response = await fetch("https://vinaydwivedin8n.mywire.org/webhook/mark-attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students: details }),
    });
    if (response.ok) {
      return "✅ Submitted to n8n (Google Sheets updated)";
    } else {
      throw new Error('n8n submission failed');
    }
  } catch (err) {
    console.error("n8n error:", err);
    return "❌ n8n submission failed";
  }
};
