import axios from 'axios';
import { getBackendUrl } from './getBackendUrl';

const BACKEND_URL = getBackendUrl();

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