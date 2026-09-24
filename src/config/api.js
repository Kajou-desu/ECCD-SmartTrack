const DEFAULT_API_URL = import.meta.env.PROD
	? 'https://eccd-backend-production.up.railway.app'
	: 'http://localhost:4000';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const IS_API_CONFIGURED = Boolean(API_BASE_URL);

export { API_BASE_URL, IS_API_CONFIGURED };