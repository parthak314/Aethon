export const API = {
  BASE_URL: "http://127.0.0.1:5000",
  ENDPOINTS: {
    ANALYSE: "/analyse"
  }
};

export const getApiUrl = (endpoint: keyof typeof API.ENDPOINTS) => {
  return `${API.BASE_URL}${API.ENDPOINTS[endpoint]}`;
};