export function getBackendUrl() {
  const mode = import.meta.env.VITE_BACKEND_MODE;
  if (mode === 'prod') {
    return import.meta.env.VITE_BACKEND_URL_PROD;
  }
  return import.meta.env.VITE_BACKEND_URL_LOCAL;
} 