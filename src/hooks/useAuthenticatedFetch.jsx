import { useUser } from '../contexts/UserContext';

export const useAuthenticatedFetch = () => {
    const { getAuthHeaders, logout } = useUser();

    const authenticatedFetch = async (url, options = {}) => {
        const config = {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                logout();
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }

            return response;
        } catch (error) {
            console.error('Ошибка при выполнении авторизованного запроса:', error);
            throw error;
        }
    };

    return authenticatedFetch;
};