import React, { useState, useEffect } from 'react';
import { TextField, Button, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './Dashboard.module.css';
import { Edit } from '@mui/icons-material';
import Selector from '../../components/Selector';
import { useNavigate, useParams } from 'react-router-dom';

export default function DashboardAdmin() {
    const {adminId} = useParams();
    const navigate = useNavigate();
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [errors, setErrors] = useState({
        email: '',
        fullName: '',
        fullSupervisorName: '',
        phoneNumber: '',
        jobTitle: '',
        divisionName: ''
    });

    const [adminData, setAdminData] = useState({
        email: "",
        fullName: "",
        fullSupervisorName: "",
        phoneNumber: "",
        jobTitle: "",
        divisionName: "",
    });
    // Загрузка данных администратора при монтировании компонента
    useEffect(() => {
        fetchAdminData();
    }, []);

    // Функция для получения данных профиля администратора с сервера
    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/dashboard/admin/getProfile', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({"adminId": adminId}),
                });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            setAdminData({
                email: data.email || "",
                fullName: data.fullName || "",
                fullSupervisorName: data.fullSupervisorName || "",
                phoneNumber: data.phoneNumber || "",
                jobTitle: data.jobTitle || "",
                divisionName: data.divisionName || ""
            });
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    // Валидация email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    // Валидация телефона
    const validatePhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
    };

    // Валидация ФИО
    const validateFullName = (name) => {
        return name.trim().split(' ').length >= 3;
    };

    // Общая валидация формы
    const validateForm = () => {
        const newErrors = {
            email: '',
            fullName: '',
            fullSupervisorName: '',
            phoneNumber: '',
            jobTitle: '',
            divisionName: ''
        };

        let isValid = true;

        // Валидация email
        if (!adminData.email) {
            newErrors.email = 'Email обязателен';
            isValid = false;
        } else if (!validateEmail(adminData.email)) {
            newErrors.email = 'Введите корректный email';
            isValid = false;
        }

        // Валидация полного имени
        if (!adminData.fullName) {
            newErrors.fullName = 'Полное имя обязательно';
            isValid = false;
        } 

        // Валидация имени руководителя
        if (!adminData.fullSupervisorName) {
            newErrors.fullSupervisorName = 'Имя руководителя обязательно';
            isValid = false;
        } 

        // Валидация телефона
        if (!adminData.phoneNumber) {
            newErrors.phoneNumber = 'Телефон обязателен';
            isValid = false;
        } else if (!validatePhone(adminData.phoneNumber)) {
            newErrors.phoneNumber = 'Введите корректный номер телефона';
            isValid = false;
        }

        // Валидация должности
        if (!adminData.jobTitle) {
            newErrors.jobTitle = 'Должность обязательна';
            isValid = false;
        } else if (adminData.jobTitle.length < 3) {
            newErrors.jobTitle = 'Название должности слишком короткое';
            isValid = false;
        }

        // Валидация подразделения
        if (!adminData.divisionName) {
            newErrors.divisionName = 'Подразделение обязательно';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (field, value) => {
        setAdminData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Сбрасываем ошибку при изменении поля
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                setLoading(true);
                const newData = {
                    adminId: localStorage.getItem('adminId'),
                    email: adminData.email,
                    fullName: adminData.fullName,
                    fullSupervisorName: adminData.fullSupervisorName,
                    phoneNumber: adminData.phoneNumber,
                    jobTitle: adminData.jobTitle,
                    divisionName: adminData.divisionName,
                }
                
                const response = await fetch('http://localhost:8081/dashboard/admin/updateProfile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newData),
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Данные администратора успешно обновлены:', data);
                setEdit(false);
                
                // Обновляем данные после успешного сохранения
                await fetchAdminData();
            } catch (error) {
                console.error('Ошибка при обновлении данных администратора:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Форма содержит ошибки');
        }
    };

    const handleGoBack = () => {
        // Используем navigate для перехода на предыдущую страницу
        navigate(-1);
    };

    const getDivisionDisplayName = (divisionName) => {
        const divisions = {
            'tender_department': 'Тендерный отдел',
            'procurement_department': 'Отдел закупок',
            'finance_department': 'Финансовый отдел',
            'legal_department': 'Юридический отдел',
            'support_department': 'Департамент поддержки',
            'management_department': 'Департамент менеджмента',
        };
        return divisions[divisionName] || divisionName;
    };

    const toogleEdit = (e) => {
        setEdit(!edit);
    };

    const handleDivisionChange = (selected) => {
        setAdminData({
            ...adminData,
            divisionName: selected
        });
        
        if (errors.divisionName) {
            setErrors(prev => ({
                ...prev,
                divisionName: ''
            }));
        }
    };

    // Показываем индикатор загрузки, пока данные загружаются
    if (loading && !edit) {
        return (
            <div className={styles.loadingContainer}>
                <CircularProgress />
                <p>Загрузка данных...</p>
            </div>
        );
    }

    // Показываем сообщение об ошибке, если что-то пошло не так
    if (error && !adminData.fullName) {
        return (
            <div className={styles.errorContainer}>
                <p>Ошибка при загрузке данных: {error}</p>
                <Button 
                    variant="contained" 
                    onClick={fetchAdminData}
                    className={styles.retryButton}
                >
                    Попробовать снова
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className={styles.mainContainer}>
                <div className={styles.backButtonContainer}>
                    <IconButton 
                        onClick={handleGoBack} 
                        className={styles.backButton}
                        size="large"
                    >
                        <ArrowBackIcon sx={{ color: '#fff', fontSize: 30 }} />
                    </IconButton>
                    {!edit && (
                        <IconButton 
                            onClick={toogleEdit} 
                            className={styles.backButton}
                            size="large"
                        >
                            <Edit sx={{ color: '#fff', fontSize: 30 }} />
                        </IconButton>
                    )}
                </div>

                <div className={`${styles.infoContainer} ${styles.adminInfo}`}>
                    <h2 className={styles.sectionTitle}>Информация об администраторе</h2>
                    
                    <div className={styles.formGrid}>
                        <TextField
                            label="Полное имя"
                            value={adminData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            variant="outlined"
                            disabled={!edit}
                            className={styles.textField}
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                        />

                        <TextField
                            disabled={!edit}
                            label="Email"
                            type="email"
                            value={adminData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.email}
                            helperText={errors.email}
                        />

                        <TextField
                            disabled={!edit}
                            label="Номер телефона"
                            value={adminData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                        />

                        <TextField
                            disabled={!edit}
                            label="Должность"
                            value={adminData.jobTitle}
                            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.jobTitle}
                            helperText={errors.jobTitle}
                        />

                        <TextField
                            disabled={!edit}
                            label="Полное имя руководителя"
                            value={adminData.fullSupervisorName}
                            onChange={(e) => handleInputChange('fullSupervisorName', e.target.value)}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.fullSupervisorName}
                            helperText={errors.fullSupervisorName}
                        />

                        <Selector
                            disabled={!edit}
                            dict={{
                                'tender_department': 'Тендерный департамент',
                                'support_department': 'Департамент поддержки',
                                'management_department': 'Департамент менеджмента',
                            }}
                            single={true}
                            defaultValue={adminData.divisionName}
                            label="Подразделение"
                            value={adminData.divisionName}
                            onSelectionChange={handleDivisionChange}
                            variant="outlined"
                            className={styles.textField}
                            error={errors.divisionName}
                        />
                        {errors.divisionName && (
                            <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '-10px', marginLeft: '14px' }}>
                                {errors.divisionName}
                            </div>
                        )}
                    </div>
                    {edit && (
                        <div className={styles.buttonContainer}>
                            <Button 
                                variant="contained"
                                onClick={handleSave}
                                className={styles.saveButton}
                                disabled={loading}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#005BB9',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0',
                                        color: '#005BB9',
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}