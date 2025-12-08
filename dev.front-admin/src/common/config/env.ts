export const getWhatsAppBaseUrl = () => {
  return import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_WHATSAPP_BASE_URL_PROD
    : import.meta.env.VITE_WHATSAPP_BASE_URL_LOCAL;
};

export const WHATSAPP_BASE_URL = getWhatsAppBaseUrl();