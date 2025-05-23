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
        blockedReason: '',
        revenueOne: '',
        revenueTwo: '',
        revenueThree: '',
        revenueFour: '',
        contract: '',
    });
    const taxFormDict = {
        "OSN": 'ОСНО',
        "USN": 'УСН',
        "ENVD": 'ЕНВД',
        "ESHN": 'ЕСХН',
        "PATENT": 'ПСН',
    }

    const [offers, setOffers] = useState([]);

    const [errors, setErrors] = useState({
        email: '',
        phoneNumber: '',
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
                    blockedReason: data.contractor.blockedReason || '',
                    revenueOne: data.contractor.revenueOne || '',
                    revenueTwo: data.contractor.revenueTwo || '',
                    revenueThree: data.contractor.revenueThree || '',
                    revenueFour: data.contractor.revenueFour || '',
                    contract: data.contractor.contract || '',
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

        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (validateForm()) {
            try {
                setLoading(true);
                // Отправляем только нужные поля на сервер
                const updateData = {
                    contractorId: localStorage.getItem('contractorId'),
                    email: contractorData.email,
                    phoneNumber: contractorData.phoneNumber
                };
                
                const response = await fetch('http://localhost:8081/dashboard/contractor/updateProfile', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData),
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
    const handleTaxformChange = (selectedCode) => {
        setContractorData({
            ...contractorData,
            taxForm: selectedCode
        });
        
        if (errors.taxForm) {
            setErrors({
                ...errors,
                taxForm: ''
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
        if (!reason) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/dashboard/contractor/blockProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractorId: contractorId,
                    blockReason: reason
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Профиль успешно заблокирован:', data);
            setBlock(false);
            setReason('');
            await fetchContractorData();
        } catch (error) {
            console.error('Ошибка при блокировке профиля:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }
    
    const handleSubmitUnblock = async (e) => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8081/dashboard/contractor/unblockProfile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contractorId: contractorId
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Профиль успешно разблокирован:', data);
            // Refresh contractor data after unblocking
            await fetchContractorData();
        } catch (error) {
            console.error('Ошибка при разблокировке профиля:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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
                            disabled={true}
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
                            disabled={true}
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
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.contractorFullName}
                            helperText={errors.contractorFullName}
                        />

                        <TextField
                            label="КПП"
                            value={contractorData.kpp}
                            onChange={(e) => handleInputChange('kpp', e.target.value)}
                            disabled={true}
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
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                            error={!!errors.foundedAt}
                            helperText={errors.foundedAt}
                        />
                        
                        <TextField
                            label="ИНН"
                            value={contractorData.inn}
                            onChange={(e) => handleInputChange('inn', e.target.value)}
                            disabled={true}
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
                            disabled={true}
                            className={styles.textField}
                            error={!!errors.okvedCode}
                            helperText={errors.okvedCode}
                            type='okved'
                            defaultValue={contractorData.okvedCode}
                        />
                        <Selector
                            label="Форма налогообложения"
                            value={contractorData.taxForm}
                            dict={taxFormDict}
                            single={true}
                            onSelectionChange={handleTaxformChange}
                            disabled={true}
                            className={styles.textField}
                            error={!!errors.taxForm}
                            helperText={errors.taxForm}
                            defaultValue={contractorData.taxForm}
                        />

                        <TextField
                            label="Адрес"
                            value={contractorData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={true}
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
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                            multiline
                            rows={2}
                            error={!!errors.contractorDescription}
                            helperText={errors.contractorDescription}
                        />

                        <TextField
                            label="Выручка за 2022 год"
                            value={contractorData.revenueOne}
                            onChange={(e) => handleInputChange('revenueOne', e.target.value)}
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                        />

                        <TextField
                            label="Выручка за 2023 год"
                            value={contractorData.revenueTwo}
                            onChange={(e) => handleInputChange('revenueTwo', e.target.value)}
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                        />

                        <TextField
                            label="Выручка за 2024 год"
                            value={contractorData.revenueThree}
                            onChange={(e) => handleInputChange('revenueThree', e.target.value)}
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                        />

                        <TextField
                            label="Выручка за 2025 год"
                            value={contractorData.revenueFour}
                            onChange={(e) => handleInputChange('revenueFour', e.target.value)}
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                        />

                        <TextField
                            label="Описание контрактов"
                            value={contractorData.contract}
                            onChange={(e) => handleInputChange('contract', e.target.value)}
                            disabled={true}
                            variant="outlined"
                            className={styles.textField}
                            multiline
                            rows={2}
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
                        <>
                            {contractorData.isBlocked ? (
                                <></>
                            ) : (
                                <div className={styles.createOfferButton}>
                                    <OfferCardComponent 
                                        cardData={''}
                                        contractor={true}
                                        create={true}
                                        contractorId={contractorData.publicId}
                                        refreshData={fetchContractorData}
                                    />
                                </div>
                            )}
                        </>
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