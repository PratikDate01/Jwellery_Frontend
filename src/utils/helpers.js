/**
 * Formats a Cloudinary URL to ensure it uses HTTPS.
 * @param {string} url - The URL to format.
 * @returns {string} - The formatted HTTPS URL.
 */
export const normalizeImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
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
