import React, { useState, useEffect } from 'react';
import { TextField, Button, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from './Dashboard.module.css';
import OfferCardComponent from '../../components/OfferCardComponent.jsx';
import Selector from '../../components/Selector.jsx';
import okvedDictionary from '../../data/okved.jsx';
import { Block, Cancel, Check, Edit, LockOpen } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

export default function DashboardContractor({ view }) {
    const {contractorId} = useParams();
    const [edit, setEdit] = useState(false);
    const [block, setBlock] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contractorData, setContractorData] = useState({
        identificationNumber: '',
        contractorName: "",
        contractorFullName: "",
        contractorDescription: "",
        email: "",
        phoneNumber: "",
        kpp: "",
        inn: "",
        foundedAt: "",
        address: "",
        taxForm: "",
        okvedCode: "",
        isBlocked: false,
        blockedReason: ''
    });

    const [offers, setOffers] = useState([]);

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
        okvedCode: '',
    });

    // Fetch contractor data when component mounts
    useEffect(() => {
        fetchContractorData();
    }, []);

    const fetchContractorData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/dashboard/contractor/getProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({"contractorId": contractorId})
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update contractorData state with fetched data
            if (data.contractor) {
                setContractorData({
                    publicId: data.contractor.publicId || '',
                    identificationNumber: data.contractor.identificationNumber || '',
                    contractorName: data.contractor.contractorName || '',
                    contractorFullName: data.contractor.contractorFullName || '',
                    contractorDescription: data.contractor.contractorDescription || '',
                    email: data.contractor.email || '',
                    phoneNumber: data.contractor.phoneNumber || '',
                    kpp: data.contractor.kpp || '',
                    inn: data.contractor.inn || '',
                    foundedAt: data.contractor.foundedAt || '',
                    address: data.contractor.address || '',
                    taxForm: data.contractor.taxForm || '',
                    okvedCode: data.contractor.okvedCode || '',
                    isBlocked: data.contractor.isBlocked || false,
                    blockedReason: data.contractor.blockedReason || ''
                });
            }
            
            // Update offers state with fetched proposals
            if (data.proposalList && data.proposalList.proposals) {
                setOffers(data.proposalList.proposals);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contractor data:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length === 11 && (digitsOnly.startsWith('7') || digitsOnly.startsWith('8'));
    };

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

    const validateKPP = (kpp) => {
        return /^\d{4}[A-Z0-9]{2}\d{3}$/.test(kpp);
    };

    const handleInputChange = (field, value) => {
        if (!view) {
            setContractorData(prev => ({
                ...prev,
                [field]: value
            }));

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

    const handleSave = async () => {
        if (validateForm()) {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8081/dashboard/contractor/updateProfile', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(contractorData),
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Данные успешно обновлены:', data);
                setEdit(false);
                
                // Refresh contractor data after update
                await fetchContractorData();
            } catch (error) {
                console.error('Ошибка при обновлении данных:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
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

    const toogleBlock = (e) => {
        setBlock(!block);
    }

    const handleSubmitBlock = async (e) => {
        if (!reason){
            return;
        }
        console.log('block' + reason);
        setBlock(false);
    }
    const handleSubmitUnblock = async (e) => {
        if (!reason){
            return;
        }
        console.log('block' + reason);
        setBlock(false);
    }

    // Show loading state
    if (loading && !edit) {
        return (
            <div className={styles.loadingContainer}>
                <CircularProgress />
                <p>Загрузка данных...</p>
            </div>
        );
    }

    // Show error state
    if (error && !contractorData.contractorName) {
        return (
            <div className={styles.errorContainer}>
                <p>Ошибка при загрузке данных: {error}</p>
                <Button 
                    variant="contained" 
                    onClick={fetchContractorData}
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
                    {edit ? (
                        <>
                        </>
                    ) : (
                        <>
                            {view ? (<></>) : (
                                <>
                                    {contractorData.isBlocked ? 
                                    (
                                        <div style={{
                                            color: '#fff', 
                                            position: 'absolute', 
                                            width: '80em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            top: '10px',
                                            left: '60px'
                                        }} 
                                        >
                                            <div>Ваш аккаун был заблокирован по причине: {contractorData.blockedReason}.</div>
                                            <div>Обратитесь в поддержку: +7 (812) 677-75-76.</div>
                                        </div>
                                    ) : (
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
                            
                        </>
                    )}
                    {view && !contractorData.isBlocked ? (
                        <IconButton 
                            onClick={toogleBlock} 
                            className={styles.backButton}
                            size="large"
                            disabled={contractorData.isBlocked}
                        >
                            {block ? (<Cancel sx={{ color: '#fff', fontSize: 30 }} />) : (<Block sx={{ color: '#fff', fontSize: 30 }} />)}
                        </IconButton>
                    ) : (<></>)}
                    {block ? (
                        <>
                            <TextField
                                placeholder="Причина блокировки"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                variant="outlined"
                            />
                            <IconButton 
                                onClick={handleSubmitBlock} 
                                className={styles.backButton}
                                size="large"
                            >
                                <Check sx={{ color: '#fff', fontSize: 30 }} />
                            </IconButton>
                        </>
                    ) : (<></>)}
                    {contractorData.isBlocked ? (
                        <>
                            {view ? (
                                <IconButton 
                                    onClick={handleSubmitUnblock} 
                                    className={styles.backButton}
                                    size="large"
                                >
                                    <LockOpen sx={{ color: '#fff', fontSize: 30 }} />
                                </IconButton>
                            ) : (
                                <div></div>
                            )}
                            
                        </>
                    ) : (<></>)}
                    
                </div>

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
                                contractorId={contractorData.publicId}
                            />
                        </div>
                    )}
                    <div className={styles.offersGrid}>
                        {offers.map((offer) => (
                            <OfferCardComponent 
                                key={offer.proposalId}
                                cardData={offer}
                                contractorId={contractorData.publicId}
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