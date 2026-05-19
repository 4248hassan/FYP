# ResolveIt Frontend

## Mock API toggle

This project uses axios-mock-adapter to provide a fully mocked backend during development.

- **To use mocks (default)**: just run `npm run dev` in the `frontend` folder.
- **To disable mocks and hit a real backend**:
  - Set the env variable `REACT_APP_USE_MOCKS=false`
  - Restart the dev server (`npm run dev`).

Mocks are initialized from `src/main.jsx` via `initMocks(process.env.REACT_APP_USE_MOCKS !== 'false')`
and configured in `src/services/mock/index.js`.

## Backend base URL

All network calls go through the shared axios instance in `src/services/api.js`.

- To point the frontend at a real backend, update the `baseURL` there, for example:

```js
// src/services/api.js
const api = axios.create({
  baseURL: 'https://your-backend.example.com/api',
})
```

You can later wire this to environment variables (e.g. different URLs for staging/production).

