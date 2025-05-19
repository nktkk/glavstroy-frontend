import React, { useState } from 'react';
import { TextField, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './Dashboard.module.css';
import OfferCardComponent from '../../components/OfferCardComponent.jsx';
import Selector from '../../components/Selector.jsx';
import okvedDictionary from '../../data/okved.jsx';
import { Edit } from '@mui/icons-material';

export default function DashboardContractor({ view }) {
    // Состояние для личных данных подрядчика с новыми полями
    const [edit, setEdit] = useState(false);
    const [contractorData, setContractorData] = useState({
        identificationNumber: '9729219090',
        contractorName: "ООО СтройГрад",
        contractorFullName: "Общество с ограниченной ответственностью «СтройГрад»",
        contractorDescription: "Строительство жилых и нежилых зданий",
        email: "contact@stroygrad.ru",
        phoneNumber: "+7 (495) 123-45-67",
        kpp: "123456789",
        inn: "9729219090",
        foundedAt: "2020-03-15",
        address: "г. Москва, ул. Строительная, д. 15",
        taxForm: "ОСН",
        okvedCode: "43.21"
    });

    const [errors, setErrors] = useState({
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
        okvedCode: ''
    });

    // Массив предложений подрядчика (остается без изменений)
    const [offers] = useState([
        // ... существующие предложения ...
    ]);

    // Валидация email
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    };

    // Валидация телефона
    const validatePhone = (phone) => {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length === 11 && (digitsOnly.startsWith('7') || digitsOnly.startsWith('8'));
    };

    // Валидация ИНН
    const validateINN = (inn) => {
        if (!/^\d{10}$/.test(inn)) return false;
        const checkDigit = [2, 4, 10, 3, 5, 9, 4, 6, 8];
        let sum = 0;
        
        for (let i = 0; i < 9; i++) {
            sum += parseInt(inn.charAt(i)) * checkDigit[i];
        }
        
        sum = sum % 11;
        sum = sum % 10;
        
        return sum === parseInt(inn.charAt(9));
    };

    // Валидация КПП
    const validateKPP = (kpp) => {
        return /^\d{4}[A-Z0-9]{2}\d{3}$/.test(kpp);
    };

    const handleInputChange = (field, value) => {
        if (!view) {
            setContractorData(prev => ({
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
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!contractorData.identificationNumber.trim()) {
            newErrors.identificationNumber = 'Идентификационный номер обязателен';
            isValid = false;
        }

        if (!contractorData.contractorName.trim()) {
            newErrors.contractorName = 'Наименование подрядчика обязательно';
            isValid = false;
        } else if (contractorData.contractorName.length < 3) {
            newErrors.contractorName = 'Наименование должно содержать не менее 3 символов';
            isValid = false;
        }

        if (!contractorData.contractorFullName.trim()) {
            newErrors.contractorFullName = 'Полное наименование обязательно';
            isValid = false;
        }

        if (!contractorData.contractorDescription.trim()) {
            newErrors.contractorDescription = 'Описание деятельности обязательно';
            isValid = false;
        }

        if (!contractorData.email.trim()) {
            newErrors.email = 'Email обязателен';
            isValid = false;
        } else if (!validateEmail(contractorData.email)) {
            newErrors.email = 'Введите корректный email';
            isValid = false;
        }

        if (!contractorData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Телефон обязателен';
            isValid = false;
        } else if (!validatePhone(contractorData.phoneNumber)) {
            newErrors.phoneNumber = 'Введите корректный номер телефона';
            isValid = false;
        }

        if (!contractorData.kpp.trim()) {
            newErrors.kpp = 'КПП обязателен';
            isValid = false;
        } else if (!validateKPP(contractorData.kpp)) {
            newErrors.kpp = 'Введите корректный КПП (9 знаков)';
            isValid = false;
        }

        if (!contractorData.inn.trim()) {
            newErrors.inn = 'ИНН обязателен';
            isValid = false;
        } else if (!validateINN(contractorData.inn)) {
            newErrors.inn = 'Введите корректный ИНН юридического лица (10 цифр)';
            isValid = false;
        }

        if (!contractorData.foundedAt) {
            newErrors.foundedAt = 'Дата основания обязательна';
            isValid = false;
        }

        if (!contractorData.address.trim()) {
            newErrors.address = 'Адрес обязателен';
            isValid = false;
        }

        if (!contractorData.taxForm.trim()) {
            newErrors.taxForm = 'Форма налогообложения обязательна';
            isValid = false;
        }

        if (!contractorData.okvedCode.trim()) {
            newErrors.okvedCode = 'Код ОКВЭД обязателен';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = () => {
        if (validateForm()) {
            console.log('Сохранение данных:', contractorData);
            setEdit(false)
            // Здесь будет логика сохранения
        } else {
            console.log('Форма содержит ошибки');
        }
    };

    const handleGoBack = () => {
        console.log('Возврат на предыдущую страницу');
    };

    const handleOkvedChange = (selectedCode) => {
        setContractorData({
            ...contractorData,
            okvedCode: selectedCode
        });
        
        if (errors.okvedCode) {
            setErrors({
                ...errors,
                okvedCode: ''
            });
        }
    };

    const toogleEdit = (e) => {
        setEdit(!edit);
    }

    return (
        <>
            <div className={styles.mainContainer}>
                {/* Кнопка возврата */}
                <div className={styles.backButtonContainer}>
                    <IconButton 
                        onClick={handleGoBack} 
                        className={styles.backButton}
                        size="large"
                    >
                        <ArrowBackIcon sx={{ color: '#fff', fontSize: 30 }} />
                    </IconButton>
                    {edit ? (
                        <>
                        </>
                    ) : (
                        <>
                            {view ? (<></>) : (
                                <IconButton 
                                    onClick={toogleEdit} 
                                    className={styles.backButton}
                                    size="large"
                                >
                                    <Edit sx={{ color: '#fff', fontSize: 30 }} />
                                </IconButton>
                            )}
                            
                        </>
                    )}
                    
                </div>

                {/* Контейнер с личными данными подрядчика */}
                <div className={`${styles.infoContainer} ${styles.contractorInfo}`}>
                    <h2 className={styles.sectionTitle}>Информация о подрядчике</h2>
                    
                    <div className={styles.formGrid}>
                        <TextField
                            label="Наименование подрядчика"
                            value={contractorData.contractorName}
                            onChange={(e) => handleInputChange('contractorName', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.contractorName}
                            helperText={errors.contractorName}
                        />
                        <TextField
                            label="Email"
                            value={contractorData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            label="Идентификационный номер"
                            value={contractorData.identificationNumber}
                            onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.identificationNumber}
                            helperText={errors.identificationNumber}
                        />
                        <TextField
                            label="Телефон"
                            value={contractorData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                        />
                        <TextField
                            label="Полное наименование"
                            value={contractorData.contractorFullName}
                            onChange={(e) => handleInputChange('contractorFullName', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.contractorFullName}
                            helperText={errors.contractorFullName}
                        />

                        <TextField
                            label="КПП"
                            value={contractorData.kpp}
                            onChange={(e) => handleInputChange('kpp', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.kpp}
                            helperText={errors.kpp}
                        />

                        <TextField
                            label="Дата основания"
                            type="date"
                            value={contractorData.foundedAt}
                            onChange={(e) => handleInputChange('foundedAt', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.foundedAt}
                            helperText={errors.foundedAt}
                        />
                        
                        <TextField
                            label="ИНН"
                            value={contractorData.inn}
                            onChange={(e) => handleInputChange('inn', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.inn}
                            helperText={errors.inn}
                        />

                        <Selector
                            label="Код ОКВЭД"
                            value={contractorData.okvedCode}
                            dict={okvedDictionary}
                            single={true}
                            onSelectionChange={handleOkvedChange}
                            disabled={view || !edit}
                            className={styles.textField}
                            error={!!errors.okvedCode}
                            helperText={errors.okvedCode}
                            type='okved'
                            defaultValue={contractorData.okvedCode}
                        />
                        <TextField
                            label="Форма налогообложения"
                            value={contractorData.taxForm}
                            onChange={(e) => handleInputChange('taxForm', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.taxForm}
                            helperText={errors.taxForm}
                        />

                        <TextField
                            label="Адрес"
                            value={contractorData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            multiline
                            rows={2}
                            error={!!errors.address}
                            helperText={errors.address}
                        />

                        
                        <TextField
                            label="Описание деятельности"
                            value={contractorData.contractorDescription}
                            onChange={(e) => handleInputChange('contractorDescription', e.target.value)}
                            disabled={view || !edit}
                            variant="outlined"
                            className={styles.textField}
                            multiline
                            rows={2}
                            error={!!errors.contractorDescription}
                            helperText={errors.contractorDescription}
                        />

                        
                    </div>

                    {!view && edit && (
                        <div className={styles.buttonContainer}>
                            <Button 
                                variant="contained"
                                onClick={handleSave}
                                className={styles.saveButton}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#005BB9',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0',
                                        color: '#005BB9',
                                    },
                                }}
                            >
                                Сохранить изменения
                            </Button>
                        </div>
                    )}
                </div>

                {/* Контейнер со списком предложений */}
                <div className={`${styles.infoContainer} ${styles.offersContainer}`}>
                    <h2 className={styles.sectionTitle}>Предложения подрядчика</h2>
                    {view ? (
                        <></>
                    ) : (
                        <div className={styles.createOfferButton}>
                            <OfferCardComponent 
                                cardData={''}
                                contractor={true}
                                create={true}
                            />
                        </div>
                    )}
                    <div className={styles.offersGrid}>
                        {offers.map((offer) => (
                            <OfferCardComponent 
                                key={offer.proposalId}
                                cardData={offer}
                                contractor={true}
                                create={false}
                            />
                        ))}
                    </div>

                    {offers.length === 0 && (
                        <div className={styles.emptyState}>
                            {view ? (<p>У данного подрядчика пока нет предложений</p>): (<p>У вас пока нет предложений</p>)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}