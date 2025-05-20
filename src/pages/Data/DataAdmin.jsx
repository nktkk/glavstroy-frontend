import { Button, TextField, MenuItem } from "@mui/material";
import styles from './Data.module.css'
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import Selector from "../../components/Selector";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState, useEffect } from "react";
import { differenceInYears } from 'date-fns';
import { useApiService } from "../../services/apiService";
import { useNavigate } from "react-router-dom";

// Стили для скрытого инпута файла
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function DataAdmin() {
    // Импортируем метод post из нашего API-сервиса
    const { post } = useApiService();
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        'fullName': '',
        'fullSupervisorName': '',
        'email': '',
        'phoneNumber': '',
        'jobTitle': '',
        'divisionName': ''
    });

    const [errors, setErrors] = useState({
        'fullName': '',
        'fullSupervisorName': '',
        'email': '',
        'phoneNumber': '',
        'jobTitle': '',
        'divisionName': ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseError, setResponseError] = useState('');
    const [responseSuccess, setResponseSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const digitsOnly = phone.replace(/\D/g, '');
        
        if (digitsOnly.length === 11 && (digitsOnly.startsWith('7') || digitsOnly.startsWith('8'))) {
            return true;
        } else if (digitsOnly.length === 10) {
            return true;
        }
        return false;
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Полное имя обязательно';
            isValid = false;
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = 'Полное имя должно содержать не менее 3 символов';
            isValid = false;
        }

        if (!formData.fullSupervisorName.trim()) {
            newErrors.fullSupervisorName = 'Полное имя руководителя обязательно';
            isValid = false;
        } else if (formData.fullSupervisorName.length < 3) {
            newErrors.fullSupervisorName = 'Имя руководителя должно содержать не менее 3 символов';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Введите корректный email';
            isValid = false;
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Телефон обязателен';
            isValid = false;
        } else if (!validatePhone(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Введите корректный номер телефона';
            isValid = false;
        }

        if (!formData.jobTitle.trim()) {
            newErrors.jobTitle = 'Должность обязательна';
            isValid = false;
        }

        if (!formData.divisionName) {
            newErrors.divisionName = 'Подразделение обязательно';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setResponseError('');
        setResponseSuccess('');
        
        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }
        
        try {
            const response = await post('http://localhost:8081/dashboard/admin/createProfile', JSON.stringify(formData));
            setResponseSuccess('Профиль успешно создан');
            setFormData({
                'fullName': '',
                'fullSupervisorName': '',
                'email': '',
                'phoneNumber': '',
                'jobTitle': '',
                'divisionName': ''
            });
            navigate('/proposals');
            console.log('Успешный ответ:', response);
        } catch (err) {
            setResponseError(err.message || 'Произошла ошибка при создании профиля');
            console.error('Ошибка при создании профиля:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles.mainContainer}>
                <div className={styles.header}>
                    <h1>Заполните данные</h1>
                </div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <form onSubmit={handleSubmit} className={styles.wrapper}>
                        <div className={styles.blank}></div>
                        <div className={styles.form}>
                            {responseError && (
                                <div className={styles.formItem} style={{ color: 'red', marginBottom: '1em' }}>
                                    {responseError}
                                </div>
                            )}
                            {responseSuccess && (
                                <div className={styles.formItem} style={{ color: 'green', marginBottom: '1em' }}>
                                    {responseSuccess}
                                </div>
                            )}
                            <div className={styles.infoForm}>
                                <div className={styles.formItem} style={{fontWeight: 600}}>Основная информация</div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        label="Полное имя" 
                                        fullWidth
                                        error={!!errors.fullName}
                                        helperText={errors.fullName}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="fullSupervisorName"
                                        value={formData.fullSupervisorName}
                                        onChange={handleChange}
                                        label="Полное имя руководителя" 
                                        fullWidth
                                        error={!!errors.fullSupervisorName}
                                        helperText={errors.fullSupervisorName}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        label="Должность" 
                                        fullWidth
                                        error={!!errors.jobTitle}
                                        helperText={errors.jobTitle}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        select
                                        name="divisionName"
                                        value={formData.divisionName}
                                        onChange={handleChange}
                                        label="Подразделение" 
                                        fullWidth
                                        error={!!errors.divisionName}
                                        helperText={errors.divisionName}
                                        required
                                    >
                                        <MenuItem value="tender_department">Тендерный отдел</MenuItem>
                                        <MenuItem value="support_department">Отдел поддержки</MenuItem>
                                        <MenuItem value="management_department">Отдел управления</MenuItem>
                                    </TextField>
                                </div>
                            </div>
                            <div className={styles.contactForm}>
                                <div className={styles.formItem} style={{fontWeight: 600}}>Контактная информация</div>
                                <div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            label="Email" 
                                            fullWidth
                                            error={!!errors.email}
                                            helperText={errors.email}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            label="Телефон" 
                                            fullWidth
                                            error={!!errors.phoneNumber}
                                            helperText={errors.phoneNumber}
                                            required
                                            placeholder="+7 (XXX) XXX-XX-XX"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.submitButtonContainer} style={{ marginTop: '2em', marginBottom: '2em', display: 'flex', justifyContent: 'left' }}>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    disabled={isSubmitting}
                                    sx={{ 
                                        minWidth: '200px',
                                        bgcolor: 'black',
                                        color: 'white',
                                        '&:hover': {
                                            color: '#ffffffde',
                                        },
                                    }}
                                >
                                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </LocalizationProvider>
            </div>
        </>
    );
}