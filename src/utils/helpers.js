export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800';

/**
 * Formats a Cloudinary URL to ensure it uses HTTPS and has a valid file extension.
 * @param {string} url - The URL to format.
 * @returns {string} - The formatted HTTPS URL.
 */
export const normalizeImageUrl = (url) => {
  if (!url) return DEFAULT_PRODUCT_IMAGE;
  let formattedUrl = url;
  if (formattedUrl.startsWith('http://')) {
    formattedUrl = formattedUrl.replace('http://', 'https://');
  }
  if (formattedUrl.includes('cloudinary.com') && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(formattedUrl.split('?')[0])) {
    formattedUrl = `${formattedUrl}.jpg`;
  }
  return formattedUrl;
};

/**
 * Safely access nested data or return a fallback.
 * @param {any} data - The data to access.
 * @param {any} fallback - The fallback value.
 * @returns {any} - The data or fallback.
 */
export const safeData = (data, fallback = []) => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  return fallback;
};
