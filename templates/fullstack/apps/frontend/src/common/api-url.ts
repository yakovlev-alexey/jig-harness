export const apiUrl = import.meta.env.SSR ? `${process.env.SSR_API_ORIGIN}/api` : '/api';
