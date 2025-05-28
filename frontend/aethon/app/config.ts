export const API = {
  BASE_URL: "http://172.29.109.113:5000",
  ENDPOINTS: {
    ANALYSE: "/analyse"
  }
};

export const getApiUrl = (endpoint: keyof typeof API.ENDPOINTS) => {
  return `${API.BASE_URL}${API.ENDPOINTS[endpoint]}`;
};