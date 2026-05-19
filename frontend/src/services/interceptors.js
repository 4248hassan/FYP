export function attachInterceptors(client) {
  // Attach token from localStorage on each request
  client.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('authToken')
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
          console.debug('[api] attaching auth token to request', config.url)
        } else {
          console.debug('[api] no auth token found for request', config.url)
        }
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Handle 401 responses and generic errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const url = error?.config?.url

      if (status === 401) {
        // Don't redirect on login/register attempts - let the component handle it
        if (url && (url.includes('/auth/login') || url.includes('/auth/register'))) {
          // Just reject, don't redirect
        } else {
          // Basic logout behavior: clear token and redirect to login.
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('authToken')
            // Adjust path as needed for your router setup.
            window.location.href = '/auth/login'
          }
        }
      }

      // Generic error handling hook
      // You can replace this with a toast/notification system later.
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('API error:', error)
      }

      return Promise.reject(error)
    },
  )

  return client
}

