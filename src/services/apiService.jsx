import { useUser } from '../context/UserContext';

const API_URL = '/api/v1';

export const createApiService = () => {
  const { token, getAuthHeaders, logout } = useUser();

  const validateToken = () => {
    if (!token) {
      throw new Error('No access token available');
    }
    return true;
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) throw new Error('No refresh token');
      
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refresh}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      
      if (!response.ok) throw new Error('Failed to refresh token');
      
      const tokens = await response.json();
      
      localStorage.setItem('authToken', tokens.access_token);
      
      window.location.reload();
      
      return tokens.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      window.location.href = '/login';
      return null;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const fullUrl = `${API_URL}${url}`;
    
    try {
      validateToken();
      
      const authHeaders = getAuthHeaders();
      
      const headers = {
        ...options.headers,
        ...authHeaders
      };
      
      const response = await fetch(fullUrl, { ...options, headers });

      if (response.status === 401) {
        console.log('Token expired, trying to refresh...');
        
        const newToken = await refreshToken();
        
        if (!newToken) {
          throw new Error('Failed to refresh token');
        }
        
        const newAuthHeaders = getAuthHeaders();
        const newHeaders = {
          ...options.headers,
          ...newAuthHeaders
        };
        
        return fetch(fullUrl, { ...options, headers: newHeaders });
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error.message.includes('token') || error.message.includes('auth')) {
        logout();
      }
      
      throw error;
    }
  };

  return {
    get: (url) => fetchWithAuth(url, { method: 'GET' }),
    post: (url, data) => fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }),
    patch: (url, data) => fetchWithAuth(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }),
    delete: (url, data) => fetchWithAuth(url, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  };
};

export const useApiService = () => {
  const userContext = useUser();
  
  if (!userContext.isAuthenticated()) {
    throw new Error('User must be authenticated to use API service');
  }
  
  return createApiService();
};

export default createApiService;