import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import styles from './Auth.module.css'
import { TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';

export default function Auth(){
    const [form, setForm] = useState({'email': '', 'password': ''});
    const [errors, setErrors] = useState({});
    const [regToggle, setRegToggle] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    const { login, register } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm({
            ...form,
            [name]: value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        if (submitError) {
            setSubmitError('');
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => { 
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return passwordRegex.test(password);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!form.email) {
            newErrors.email = 'Email обязателен';
        } else if (!validateEmail(form.email)) {
            newErrors.email = 'Неверный формат email';
        }
        
        if (!form.password) {
            newErrors.password = 'Пароль обязателен';
        } else if (regToggle && !validatePassword(form.password)) {
            newErrors.password = 'Пароль должен содержать не менее 8 символов, включая цифры, строчные и заглавные буквы';
        }
        
        if (regToggle) {
            if (!form.confirmPwd) {
                newErrors.confirmPwd = 'Подтверждение пароля обязательно';
            } else if (form.password !== form.confirmPwd) {
                newErrors.confirmPwd = 'Пароли не совпадают';
            }
            
            if (!form.role) {
                newErrors.role = 'Выберите роль';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getRoleBasedPath = (role) => {
        switch (role) {
            case 'ADMIN':
                return '/data/admin';
            case 'CONTRACTOR':
                return '/data/contractor';
            default:
                return '/login';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');
        const isFormValid = validateForm();
        
        if (isFormValid) {
            setLoading(true);
            
            try {
                let result;
                if (regToggle) {
                    result = await register({
                        email: form.email,
                        password: form.password,
                        role: form.role
                    });
                    
                    if (result.success) {
                        const loginResult = await login({
                            email: form.email,
                            password: form.password
                        });
                        
                        if (loginResult.success && loginResult.user) {
                            const rolePath = getRoleBasedPath(loginResult.user.role);
                            navigate(rolePath, { replace: true });
                        } else {
                            setSubmitError('Ошибка при автоматическом входе после регистрации');
                        }
                    } else {
                        setSubmitError(result.error || 'Произошла ошибка при регистрации');
                    }
                } else {
                    result = await login({
                        email: form.email,
                        password: form.password
                    });
                    
                    if (result.success && result.user) {
                        switch (result.user.role) {
                            case 'ADMIN':
                                navigate('/proposals', { replace: true });
                                break;
                            case 'CONTRACTOR':
                                const idcontr = localStorage.getItem('contractorId');
                                navigate(`/dashboard/contractor/${idcontr}`, { replace: true });
                                break;
                            default:
                                navigate('/login', { replace: true });
                                break;
                        }
                        
                    } else {
                        setSubmitError(result.error || 'Произошла ошибка при входе');
                    }
                }
            } catch (error) {
                setSubmitError('Произошла ошибка при обработке запроса');
                console.error('Ошибка при отправке формы:', error);
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Форма содержит ошибки');
        }
    };

    const handleRegToggle = (event) => {
        event.preventDefault();
        setSubmitError('');
        setErrors({});
        
        if (regToggle) {
            setForm({'email': '', 'password': ''});
        } else {
            setForm({'email': '', 'password': '', 'confirmPwd': '', 'role': ''});
        }
        setRegToggle(!regToggle);
    }

    return(
        <>
            <div className={styles.mainContainer}>
                <div className={styles.header}>
                    {regToggle ? (<h1>Регистрация</h1>) : (<h1>Авторизация</h1>)}
                </div>
                <div className={styles.form}>
                    {submitError && (
                        <Alert severity="error" style={{ marginBottom: '16px' }}>
                            {submitError}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formItem}>
                            <TextField 
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                label="Email"
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formItem}>
                            <TextField 
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                label="Пароль"
                                fullWidth
                                error={!!errors.password}
                                helperText={errors.password}
                                required
                                disabled={loading}
                            />
                        </div>
                        {regToggle ? (
                            <>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="password"
                                        name="confirmPwd"
                                        value={form.confirmPwd}
                                        onChange={handleChange}
                                        label="Подтвердите пароль"
                                        fullWidth
                                        error={!!errors.confirmPwd}
                                        helperText={errors.confirmPwd}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        label="Роль"
                                        fullWidth
                                        select
                                        error={!!errors.role}
                                        helperText={errors.role}
                                        required
                                        disabled={loading}
                                    >
                                        <MenuItem value={'CONTRACTOR'}>Подрядчик</MenuItem>
                                        <MenuItem value={'ADMIN'}>Сотрудник ГС-СПб</MenuItem>
                                    </TextField>
                                </div>
                            </>
                        ) : (<></>)}
                        <div className={styles.formSubmitButton}>
                            <Button
                                type="submit"
                                disabled={loading}
                                sx={{ 
                                    minWidth: '200px',
                                    bgcolor: 'black',
                                    color: 'white',
                                    '&:hover': {
                                        color: '#ffffffde',
                                    },
                                    '&:disabled': {
                                        bgcolor: '#cccccc',
                                        color: '#666666',
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {loading && <CircularProgress size={20} color="inherit" />}
                                {regToggle ? (<>Зарегистрироваться</>) : (<>Войти</>)}
                            </Button>
                        </div>
                    </form>
                    
                    <div className={styles.registerSwitchBox}>
                        <Button 
                            onClick={handleRegToggle}
                            disabled={loading}
                            sx={{
                                fontFamily: 'Montserrat',
                                fontWeight: 400,
                                fontSize: '1em',
                                color: 'black',
                                border: 'none',
                                backgroundColor: '#fff',
                                borderRadius: '0px',
                                height: '2em',
                                textTransform: 'none',
                                padding: '0.8em',
                                whiteSpace: 'nowrap',
                                boxShadow: 'none',
                                minWidth: 0,
                                '&:hover': {
                                    border: 'none',
                                    boxShadow: 'none',
                                    color: 'grey',
                                },
                                '&:disabled': {
                                    color: '#cccccc',
                                },
                            }}
                        >
                            {regToggle ? (<>Войти</>) : (<>Зарегистрироваться</>)}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}