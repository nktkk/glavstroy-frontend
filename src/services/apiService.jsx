import { useUser } from '../contexts/UserContext';

export const useApiService = () => {
  const { getAuthHeaders, logout } = useUser();
  
  const handleResponse = async (response) => {
    if (response.status === 401) {
      logout();
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
    }
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    try {
      const data = isJson ? await response.json() : await response.text();
      
      if (!response.ok) {
        const error = (typeof data === 'string') ? data : (data.message || 'Произошла ошибка при выполнении запроса');
        throw new Error(error);
      }
      
      return data;
    } catch (error) {
      if (error.message === 'Сессия истекла. Пожалуйста, войдите снова.') {
        throw error;
      }
      console.error('Ошибка при обработке ответа:', error);
      throw new Error('Ошибка при обработке ответа от сервера');
    }
  };
  
  const post = async (url, data, options = {}) => {
    try {
      const config = {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options
      };
      
      const response = await fetch(url, config);
      return await handleResponse(response);
    } catch (error) {
      console.error(`Ошибка в POST запросе на ${url}:`, error);
      throw error;
    }
  };
  
  return {
    post
  };
};

export default useApiService;