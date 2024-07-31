const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development'

export const baseUrl = isDevelopment ? import.meta.env.VITE_DEV_URL : import.meta.env.VITE_PROD_URL