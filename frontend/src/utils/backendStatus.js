import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

export const checkBackendStatus = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, {
      timeout: 3000, // 3 second timeout
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getBackendUrl = () => BACKEND_URL; 