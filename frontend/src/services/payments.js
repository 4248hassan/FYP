import api from './api'

// Payment helpers prepared for future JazzCash/EasyPaisa (or other gateway) integration.
//
// Current behavior:
// - Talks to mocked backend endpoints:
//   - POST /payment/create
//   - POST /payment/release
//
// To integrate with real payment gateways later:
// - Keep all sensitive credentials and signing logic on the backend.
// - Typical flow for JazzCash/EasyPaisa:
//   1) Frontend calls POST /payment/create with amount, orderId, etc.
//   2) Backend creates a payment request with the gateway, signs the payload,
//      and returns a redirect URL or payment token to the frontend.
//   3) Frontend redirects user or opens hosted payment UI using that token/URL.
//   4) Gateway notifies backend via webhooks; backend finalizes payment state.
// - For releasing payments (escrow-style):
//   - Frontend calls POST /payment/release with paymentId.
//   - Backend calls gateway API to capture/release funds.

export async function createPaymentIntent(payload) {
  const response = await api.post('/payment/create', payload)
  return response.data
}

export async function releasePayment(paymentId) {
  const response = await api.post('/payment/release', { paymentId })
  return response.data
}

export default {
  createPaymentIntent,
  releasePayment,
}


