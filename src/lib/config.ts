// let _baseUrl = import.meta.env.VITE_API_URL;
let _baseUrl = '';
let _mediaBaseUrl = '';

export const getBaseUrl = () => _baseUrl;
export const getMediaBaseUrl = () => _mediaBaseUrl;

export function updateConfig(data: Record<string, unknown>) {
  if (typeof data.base_url === 'string') {
    _baseUrl = data.base_url.replace(/\/+$/, '');
  }
  if (typeof data.media_base_url === 'string') {
    _mediaBaseUrl = data.media_base_url;
  }
}
