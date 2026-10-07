// Production builds require VITE_API_URL (enforced in vite.config.js); the
// localhost default is for development only.
const DEFAULT_API_URL = 'http://localhost:4000';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const IS_API_CONFIGURED = Boolean(API_BASE_URL);

export { API_BASE_URL, IS_API_CONFIGURED };