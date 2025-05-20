import { createContext, useContext, useState, useEffect } from 'react';
import { decodeJWT } from '../utils/tokenUtils';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser должен использоваться внутри UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Ошибка парсинга данных пользователя:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const extractUserFromToken = (token) => {
        const decoded = decodeJWT(token);
        if (!decoded) return null;
        
        return {
            email: decoded.sub,
            role: decoded.role,
        };
    };

    const login = async (credentials) => {
        try {
            const response = await fetch('http://localhost:8085/auth-service/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: credentials.email,
                    password: credentials.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка авторизации');
            }

            const data = await response.json();
            
            if (data.token) {
                setToken(data.token);
                localStorage.setItem('authToken', data.token);
                
                const userInfo = extractUserFromToken(data.token);
                
                if (!userInfo) {
                    const fallbackUser = {
                        email: credentials.email,
                        role: data.role || 'user'
                    };
                    setUser(fallbackUser);
                    localStorage.setItem('user', JSON.stringify(fallbackUser));
                    return { success: true, user: fallbackUser };
                }
                
                setUser(userInfo);
                localStorage.setItem('user', JSON.stringify(userInfo));
                
                return { success: true, user: userInfo };
            } else {
                throw new Error('Токен не получен');
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            return { 
                success: false, 
                error: error.message || 'Ошибка при входе в систему' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:8085/auth-service/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.email, 
                    password: userData.password,
                    role: userData.role
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка регистрации');
            }

            const data = await response.json();
            
            if (data.token) {
                return { success: true };
            } else {
                throw new Error('Токен не получен');
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            return { 
                success: false, 
                error: error.message || 'Ошибка при регистрации' 
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    const isAuthenticated = () => {
        return !!token && !!user;
    };

    const getAuthHeaders = () => {
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        getAuthHeaders
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};