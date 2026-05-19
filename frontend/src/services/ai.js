import api from './api'

// AI helpers prepared for Gemini (or other LLM) integration.
//
// Current behavior:
// - Uses mocked backend endpoints that simulate AI responses:
//   - POST /ai/chat
//   - POST /ai/recommend
//
// To integrate with real Gemini later:
// - Move the Gemini API key and logic to your backend only (never expose keys in frontend).
// - Have your backend expose endpoints like /ai/chat and /ai/recommend that:
//   - Validate the incoming payload (user prompt, context, etc.)
//   - Call the Gemini API (e.g., via REST or official SDK) and stream or return the response.
// - Keep the same frontend function signatures so UI code does not change.

export async function sendChatMessage(payload) {
  const response = await api.post('/ai/chat', payload)
  return response.data
}

export async function getVendorRecommendations(payload) {
  const response = await api.post('/ai/recommend', payload)
  return response.data
}

export default {
  sendChatMessage,
  getVendorRecommendations,
}


