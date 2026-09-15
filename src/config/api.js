const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const IS_API_CONFIGURED = Boolean(API_BASE_URL);

export { API_BASE_URL, IS_API_CONFIGURED };