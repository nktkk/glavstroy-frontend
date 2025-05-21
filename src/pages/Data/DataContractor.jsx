import { Button, TextField } from "@mui/material";
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
import okvedDictionary from "../../data/okved";
import { useNavigate } from "react-router-dom";
import { useApiService } from "../../services/apiService";
import { useUser } from '../../contexts/UserContext';


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

export default function DataContractor() {
    const { post } = useApiService();
    const navigate = useNavigate();
    const [responseError, setResponseError] = useState('');
    const [responseSuccess, setResponseSuccess] = useState('');
    const [formData, setFormData] = useState({
        'identificationNumber': '',
        'contractorName': '',
        'contractorFullName': '',
        'contractorDescription': '',
        'email': '',
        'phoneNumber': '',
        'kpp': '',
        'inn': '',
        'foundedAt': '',
        'address': '',
        'taxForm': '',
        'okvedCode': '',
        'revenueOne': '',
        'revenueTwo': '',
        'revenueThree': '',
        'revenueFour': '',
        'contract': '',
    });
    const [errors, setErrors] = useState({
        'identificationNumber': '',
        'contractorName': '',
        'contractorFullName': '',
        'contractorDescription': '',
        'email': '',
        'phoneNumber': '',
        'kpp': '',
        'inn': '',
        'foundedAt': '',
        'address': '',
        'taxForm': '',
        'okvedCode': '',
        'revenueOne': '',
        'revenueTwo': '',
        'revenueThree': '',
        'revenueFour': '',
        'contract': '',
    });
    const taxFormDict = {
        "OSN": 'ОСНО',
        "USN": 'УСН',
        "ENVD": 'ЕНВД',
        "ESHN": 'ЕСХН',
        "PATENT": 'ПСН',
    }

    const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            foundedAt: date
        });
        
        if (errors.foundedAt) {
            setErrors({
                ...errors,
                foundedAt: ''
            });
        }
    };

    const handleOkvedChange = (selectedCode) => {
        setFormData({
            ...formData,
            okvedCode: selectedCode
        });
        
        if (errors.okvedCode) {
            setErrors({
                ...errors,
                okvedCode: ''
            });
        }
    };

    const handleContractFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setContractFile(selectedFile);
        if (errors.contractFile) {
            setErrors({
                ...errors,
                contractFile: ''
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

    const validateINN = (inn) => {
        if (!/^\d{10}$/.test(inn)) {
            return false;
        }
        const checkDigit = [2, 4, 10, 3, 5, 9, 4, 6, 8];
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            sum += parseInt(inn.charAt(i)) * checkDigit[i];
        }
        
        sum = sum % 11;
        sum = sum % 10;
        
        return sum === parseInt(inn.charAt(9));
    };

    const validateKPP = (kpp) => {
        return /^\d{4}[A-Z0-9]{2}\d{3}$/.test(kpp);
    };

    const validateFoundedAt = (date) => {
        if (!date) return false;
        
        const currentDate = new Date();
        if (date > currentDate) return false;
        
        return true;
    };

    const validateExcelFile = (file) => {
        if (!file) return false;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return fileExtension === 'xlsx' || fileExtension === 'xls';
    };

    // Функция для валидации числового поля
    const validateRevenue = (value) => {
        // Проверяем, что строка содержит только цифры, точку или запятую
        if (!value.trim()) {
            return false;
        }
        
        // Проверка на числовое значение (с учетом точки или запятой)
        const cleanValue = value.replace(',', '.');
        return !isNaN(parseFloat(cleanValue)) && isFinite(cleanValue);
    };

    // Функция для форматирования числа в формат BigDecimal
    const formatToBigDecimal = (value) => {
        if (!value) return '0.0';
        
        // Заменяем запятую на точку
        let formatted = value.replace(',', '.');
        
        // Если в строке нет ни точки, ни запятой, добавляем '.0'
        if (!formatted.includes('.')) {
            formatted = `${formatted}.0`;
        } else {
            // Если есть точка, но после нее нет цифр, добавляем '0'
            const parts = formatted.split('.');
            if (parts.length > 1 && parts[1] === '') {
                formatted = `${parts[0]}.0`;
            }
        }
        
        return formatted;
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.identificationNumber.trim()) {
            newErrors.identificationNumber = 'Идентификационный номер обязателен';
            isValid = false;
        }

        if (!formData.contractorName.trim()) {
            newErrors.contractorName = 'Наименование подрядчика обязательно';
            isValid = false;
        } else if (formData.contractorName.length < 3) {
            newErrors.contractorName = 'Наименование должно содержать не менее 3 символов';
            isValid = false;
        }

        if (!formData.contractorFullName.trim()) {
            newErrors.contractorFullName = 'Полное наименование обязательно';
            isValid = false;
        } else if (formData.contractorFullName.length < 3) {
            newErrors.contractorFullName = 'Полное наименование должно содержать не менее 3 символов';
            isValid = false;
        }

        if (!formData.contractorDescription.trim()) {
            newErrors.contractorDescription = 'Описание деятельности обязательно';
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

        if (!formData.kpp.trim()) {
            newErrors.kpp = 'КПП обязателен';
            isValid = false;
        } else if (!validateKPP(formData.kpp)) {
            newErrors.kpp = 'Введите корректный КПП (9 знаков)';
            isValid = false;
        }

        if (!formData.inn.trim()) {
            newErrors.inn = 'ИНН обязателен';
            isValid = false;
        } else if (!validateINN(formData.inn)) {
            newErrors.inn = 'Введите корректный ИНН юридического лица (10 цифр)';
            isValid = false;
        }

        if (!formData.foundedAt) {
            newErrors.foundedAt = 'Дата основания обязательна';
            isValid = false;
        } else if (!validateFoundedAt(formData.foundedAt)) {
            newErrors.foundedAt = 'Указана некорректная дата основания';
            isValid = false;
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Адрес обязателен';
            isValid = false;
        } else if (formData.address.length < 10) {
            newErrors.address = 'Введите полный адрес';
            isValid = false;
        }

        if (!formData.taxForm.trim()) {
            newErrors.taxForm = 'Форма налогообложения обязательна';
            isValid = false;
        }

        if (!formData.okvedCode) {
            newErrors.okvedCode = 'Выберите код ОКВЭД';
            isValid = false;
        }
        
        // Валидация полей выручки
        if (!formData.revenueOne.trim()) {
            newErrors.revenueOne = 'Введите выручку за 2022 год';
            isValid = false;
        } else if (!validateRevenue(formData.revenueOne)) {
            newErrors.revenueOne = 'Введите корректное числовое значение';
            isValid = false;
        }
        
        if (!formData.revenueTwo.trim()) {
            newErrors.revenueTwo = 'Введите выручку за 2023 год';
            isValid = false;
        } else if (!validateRevenue(formData.revenueTwo)) {
            newErrors.revenueTwo = 'Введите корректное числовое значение';
            isValid = false;
        }
        
        if (!formData.revenueThree.trim()) {
            newErrors.revenueThree = 'Введите выручку за 2024 год';
            isValid = false;
        } else if (!validateRevenue(formData.revenueThree)) {
            newErrors.revenueThree = 'Введите корректное числовое значение';
            isValid = false;
        }
        
        if (!formData.revenueFour.trim()) {
            newErrors.revenueFour = 'Введите выручку за 2025 год';
            isValid = false;
        } else if (!validateRevenue(formData.revenueFour)) {
            newErrors.revenueFour = 'Введите корректное числовое значение';
            isValid = false;
        }
        
        if (!formData.contract.trim()) {
            newErrors.contract = 'Введите описание контрактов';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };
    const handleTaxformChange = (selectedCode) => {
        setFormData({
            ...formData,
            taxForm: selectedCode
        });
        
        if (errors.taxForm) {
            setErrors({
                ...errors,
                taxForm: ''
            });
        }
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
        
        // Форматируем числовые поля выручки для BigDecimal
        const formattedRevenueOne = formatToBigDecimal(formData.revenueOne);
        const formattedRevenueTwo = formatToBigDecimal(formData.revenueTwo);
        const formattedRevenueThree = formatToBigDecimal(formData.revenueThree);
        const formattedRevenueFour = formatToBigDecimal(formData.revenueFour);
        
        const jsonData = {
            'identificationNumber': formData.identificationNumber,
            'contractorName': formData.contractorName,
            'contractorFullName': formData.contractorFullName,
            'contractorDescription': formData.contractorDescription,
            'email': formData.email,
            'phoneNumber': formData.phoneNumber,
            'kpp': formData.kpp,
            'inn': formData.inn,
            'foundedAt': formData.foundedAt,
            'address': formData.address,
            'taxForm': formData.taxForm,
            'okvedCode': formData.okvedCode,
            'revenueOne': formattedRevenueOne,
            'revenueTwo': formattedRevenueTwo,
            'revenueThree': formattedRevenueThree,
            'revenueFour': formattedRevenueFour,
            'contract': formData.contract
        };

        // 2. Создание FormData для файлов
        const formDataToSend = new FormData();
        console.log(jsonData);
        
        // 3. Добавляем JSON как строку в FormData
        formDataToSend.append('request', new Blob(
            [JSON.stringify(jsonData)],
            { type: 'application/json' }
        ), 'data.json');
        

        try {
            const response = await fetch('http://localhost:8081/dashboard/contractor/createProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }       
            const contentType = response.headers.get('content-type');
            let responseData;
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                try {
                    responseData = JSON.parse(text); // Попытка парсинга, если это JSON строка
                } catch {
                    responseData = { contractorId: text }; // Создаем объект с contractorId
                }
            }

            if (responseData.contractorId) {
                localStorage.setItem('contractorId', responseData.contractorId);
                console.log('ID подрядчика сохранен:', responseData.contractorId);
            } else {
                console.warn('Ответ сервера не содержит contractorId');
            }
            
            setResponseSuccess('Профиль успешно создан');
            setFormData({
                identificationNumber: '',
                contractorName: '',
                contractorFullName: '',
                contractorDescription: '',
                email: '',
                phoneNumber: '',
                kpp: '',
                inn: '',
                foundedAt: '',
                address: '',
                taxForm: '',
                okvedCode: '',
                revenueOne: '',
                revenueTwo: '',
                revenueThree: '',
                revenueFour: '',
                contract: '',
            });
            if (responseData.contractorId) {
                navigate(`/dashboard/contractor/${responseData.contractorId}`);
            }
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
                                <div className={styles.formItem} style={{fontWeight: 600}}>Информация о компании</div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="identificationNumber"
                                        value={formData.identificationNumber}
                                        onChange={handleChange}
                                        label="Идентификационный номер" 
                                        fullWidth
                                        error={!!errors.identificationNumber}
                                        helperText={errors.identificationNumber}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="contractorName"
                                        value={formData.contractorName}
                                        onChange={handleChange}
                                        label="Наименование подрядчика" 
                                        fullWidth
                                        error={!!errors.contractorName}
                                        helperText={errors.contractorName}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="contractorFullName"
                                        value={formData.contractorFullName}
                                        onChange={handleChange}
                                        label="Полное наименование" 
                                        fullWidth
                                        error={!!errors.contractorFullName}
                                        helperText={errors.contractorFullName}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <TextField 
                                        type="text"
                                        name="contractorDescription"
                                        value={formData.contractorDescription}
                                        onChange={handleChange}
                                        label="Описание деятельности" 
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        error={!!errors.contractorDescription}
                                        helperText={errors.contractorDescription}
                                        required
                                    />
                                </div>
                                <div className={styles.formItem}>
                                    <DatePicker
                                        label="Дата основания"
                                        value={formData.foundedAt}
                                        onChange={handleDateChange}
                                        fullWidth
                                        slotProps={{
                                            textField: {
                                                error: !!errors.foundedAt,
                                                helperText: errors.foundedAt,
                                                required: true
                                            }
                                        }}
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputLabel-outlined': {
                                                fontFamily: 'Montserrat',
                                                color: errors.foundedAt ? 'error.main' : '#000',
                                                backgroundColor: '#fff',
                                                paddingRight: '8px',
                                            },
                                            '& .MuiInputLabel-outlined.Mui-focused': {
                                                marginRight: '8px',
                                                color: errors.foundedAt ? 'error.main' : 'black',
                                                backgroundColor: '#fff',
                                                paddingRight: '8px',
                                            },
                                            '&:hover .MuiInputLabel-outlined': {
                                                color: 'grey',
                                            },
                                            '&:hover .MuiInputLabel-outlined.Mui-focused': {
                                                color: 'grey',
                                            },
                                            '& fieldset': {
                                                border: errors.foundedAt ? '1px solid #d32f2f' : '1px solid black',
                                                borderRadius: '0px',
                                            },
                                        }}
                                    />
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
                            <div className={styles.juridicialForm}>
                                <div className={styles.formItem} style={{fontWeight: 600}}>Юридическая информация</div>
                                <div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            label="Адрес" 
                                            fullWidth
                                            error={!!errors.address}
                                            helperText={errors.address}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="kpp"
                                            value={formData.kpp}
                                            onChange={handleChange}
                                            label="КПП" 
                                            fullWidth
                                            error={!!errors.kpp}
                                            helperText={errors.kpp}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="inn"
                                            value={formData.inn}
                                            onChange={handleChange}
                                            label="ИНН"
                                            fullWidth
                                            error={!!errors.inn}
                                            helperText={errors.inn}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formItem}>
                                        <Selector
                                            label="Форма налогообложения"
                                            value={formData.taxForm}
                                            dict={taxFormDict}
                                            single={true}
                                            onSelectionChange={handleTaxformChange}
                                            error={!!errors.taxForm}
                                            helperText={errors.taxForm}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.financialForm}>
                                <div className={styles.formItem} style={{fontWeight: 600}}>Финансовая информация</div>
                                <div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="revenueOne"
                                            value={formData.revenueOne}
                                            onChange={handleChange}
                                            label="Выручка за 2022 год" 
                                            fullWidth
                                            error={!!errors.revenueOne}
                                            helperText={errors.revenueOne}
                                            required
                                            placeholder="Например: 1000000.00"
                                        />
                                    </div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="revenueTwo"
                                            value={formData.revenueTwo}
                                            onChange={handleChange}
                                            label="Выручка за 2023 год" 
                                            fullWidth
                                            error={!!errors.revenueTwo}
                                            helperText={errors.revenueTwo}
                                            required
                                            placeholder="Например: 1000000.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="revenueThree"
                                            value={formData.revenueThree}
                                            onChange={handleChange}
                                            label="Выручка за 2024 год" 
                                            fullWidth
                                            error={!!errors.revenueThree}
                                            helperText={errors.revenueThree}
                                            required
                                            placeholder="Например: 1000000.00"
                                        />
                                    </div>
                                    <div className={styles.formItem}>
                                        <TextField 
                                            type="text"
                                            name="revenueFour"
                                            value={formData.revenueFour}
                                            onChange={handleChange}
                                            label="Выручка за 2025 год" 
                                            fullWidth
                                            error={!!errors.revenueFour}
                                            helperText={errors.revenueFour}
                                            required
                                            placeholder="Например: 1000000.00"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.miscForm}>
                                <div className={styles.formItem} style={{fontWeight: 600}}>Прочее</div>
                                <div>
                                    <div className={styles.formItem}>
                                        <Selector 
                                            type='okved'
                                            label='ОКВЭД'
                                            dict={okvedDictionary}
                                            single={true} 
                                            name="okvedCode"
                                            onSelectionChange={(okved) => handleOkvedChange(okved)}
                                            error={errors.okvedCode}
                                            helperText={errors.okvedCode}
                                        />
                                        {errors.okvedCode && (
                                            <div className="error-text" style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px' }}>
                                                {errors.okvedCode}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className={styles.formItemFile}>
                                        <TextField 
                                            type="text"
                                            name="contract"
                                            value={formData.contract}
                                            onChange={handleChange}
                                            label="Описание контрактов" 
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            error={!!errors.contract}
                                            helperText={errors.contract}
                                            required
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
                                    onClick={handleSubmit}
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