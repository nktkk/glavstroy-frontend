import { Button, FormHelperText, IconButton, Link, TextField, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './OfferCardComponent.module.css'
import { Add } from '@mui/icons-material';
import { createTheme } from '@mui/material/styles';
import Selector from './Selector';
import { useNavigate } from 'react-router-dom';
import { useApiService } from "../services/apiService";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';


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

const popupTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
            '& .MuiInputBase-inputMultiline': {
                fontFamily: 'Montserrat',
            },
          '& .MuiInputLabel-outlined': {
            fontFamily: 'Montserrat',
            color: '#333333',
            backgroundColor: '#F8F9FA',
            paddingRight: '8px',
            '&.Mui-disabled': {
              color: '#fff'
            }
          },
          '& .MuiInputLabel-outlined.Mui-focused': {
            marginRight: '8px',
            color: '#333333',
            backgroundColor: '#F8F9FA',
            paddingRight: '8px',
          },
          '&:hover .MuiInputLabel-outlined': {
            color: '#005BB9',
          },
          '&:hover .MuiInputLabel-outlined.Mui-focused': {
            color: '#333333',
          },
          '& .MuiOutlinedInput-root': {
            '& input': {
              fontFamily: 'Montserrat',
              color: '#333333',
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 100px #005BB9 inset',
                WebkitTextFillColor: '#fff',
                caretColor: '#fff',
                borderRadius: '0',
              },
            },
            '& fieldset': {
              border: '1px solid #333333',
            },
            '&:hover fieldset': {
              borderColor: '#005BB9',
            },
            '&.Mui-focused fieldset': {
              border: '1px solid #333333',
            },
            '&.Mui-disabled': {
              '& input': {
                color: '#fff',
                WebkitTextFillColor: '#fff',
              },
              '& fieldset': {
                borderColor: '#ffffffb7',
              },
              '&:hover fieldset': {
                borderColor: '#333331',
              },
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '1em',
          color: '#669DD5',
          border: '1px solid #005BB9',
          backgroundColor: '#005BB9',
          borderRadius: '0px',
          textTransform: 'none',
          padding: '0.8em',
          whiteSpace: 'nowrap',
          minWidth: 0,
          '&:hover': {
            border: '1px solid #669DD5',
            boxShadow: 'none',
            color: '#ffffffb7',
          },
          '&.Mui-selected': {
            border: '1px solid white',
            backgroundColor: '#004a9e',
            color: '#fff',
          },
          '&.Mui-disabled': {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
  },
});

const socialObjects = {
  'Школа': 'Школа',
  'Поликлиника': 'Поликлиника',
  'Больница': 'Больница',
  'Детский сад': 'Детский сад'
};
const objects = {
  'ЖК Северная долина': 'ЖК Северная долина',
  'ЖК Панорама 360': 'ЖК Панорама 360',
  'ЖК Юнтолово': 'ЖК Юнтолово',
  'Кронфорт': 'Кронфорт'
};

function formatDateTime(dateTimeString) {
    try {
        const date = new Date(dateTimeString);
        
        if (isNaN(date.getTime())) {
            return dateTimeString; 
        }
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Moscow'
        };
        
        return date.toLocaleDateString('ru-RU', options);
    } catch (error) {
        console.error('Ошибка при форматировании даты:', error);
    }
}

function CreateForm({ onSubmit, onClose, contractorId }) {
    const [offer, setOffer] = useState({
        'proposalName': '', 
        'fullProposalPrice': '',
        'contractorId': contractorId || '',
        'okvedCode': '',
        'facility': '',
        'socialFacility': '',
        'description': '',
    });
    const { post } = useApiService();
    
    const [priceListFile, setPriceListFile] = useState(null);
    const [priceListError, setPriceListError] = useState('');
    
    const [errors, setErrors] = useState({
        proposalName: '',
        description: '',
        facility: '',
        socialFacility: '',
        fullProposalPrice: ''
    });

    const validateField = (name, value) => {
        let error = '';
        
        switch(name) {
            case 'proposalName':
                if (!value.trim()) error = 'Название обязательно';
                else if (value.length > 100) error = 'Максимум 100 символов';
                break;
            case 'description':
                if (!value.trim()) error = 'Описание обязательно';
                else if (value.length > 500) error = 'Максимум 500 символов';
                break;
            case 'facility':
                if (!value) error = 'Выберите объект';
                break;
            case 'fullProposalPrice':
                if (!value) error = 'Укажите стоимость';
                else if (isNaN(Number(value.replace(',', '.')))) error = 'Некорректное число';
                else if (Number(value.replace(',', '.')) <= 0) error = 'Стоимость должна быть больше 0';
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleOfferChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
        
        setOffer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceListChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPriceListFile(file);
            setPriceListError('');
        } else {
            setPriceListError('Необходимо выбрать файл прайс-листа');
        }
    };

    const handleSelectionChange = (field, value) => {
        const error = validateField(field, value);
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
        
        setOffer(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {
            proposalName: validateField('proposalName', offer.proposalName),
            description: validateField('description', offer.description),
            facility: validateField('facility', offer.facility),
            socialFacility: validateField('socialFacility', offer.socialFacility),
            fullProposalPrice: validateField('fullProposalPrice', offer.fullProposalPrice)
        };
        
        setErrors(newErrors);
        
        // Добавляем валидацию файла прайс-листа
        const isPriceListValid = priceListFile !== null;
        if (!isPriceListValid) {
            setPriceListError('Необходимо выбрать файл прайс-листа');
        }
        
        return !Object.values(newErrors).some(error => error !== '') && isPriceListValid;
    };

    const handleSubmitOffer = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        // 1. Создаем JSON-данные из полей формы
        const jsonData = {
            'proposalName': offer.proposalName, 
            'fullProposalPrice': offer.fullProposalPrice,
            'contractorId': contractorId || '',
            'okvedCode': offer.okvedCode,
            'facility': offer.facility,
            'socialFacility': offer.socialFacility,
            'description': offer.description,
        };

        // 2. Создаем FormData для отправки
        const formDataToSend = new FormData();
        
        // 3. Добавляем JSON как Blob с правильным типом контента
        formDataToSend.append('request', new Blob(
            [JSON.stringify(jsonData)],
            { type: 'application/json' }
        ), 'data.json');
        
        // 4. Добавляем файл прайс-листа
        if (priceListFile) {
            formDataToSend.append('priceListFile', priceListFile);
        }
        
        try {
            const response = await fetch('http://localhost:8081/dashboard/contractor/createProposal', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: formDataToSend
            });
                
            if (response.ok) {
                console.log('Предложение успешно создано');
                // Сбрасываем значения формы или делаем другие действия при успешном создании
                onClose();
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Ошибка при создании предложения: ${response.status}`;
                console.error(errorMessage);
                // Показываем ошибку пользователю если необходимо
            }
        } catch (error) {
            console.error('Ошибка при отправке предложения:', error);
            // Показываем пользователю сообщение об ошибке
        }
    } else {
        console.log('Форма содержит ошибки');
    }
};


    return (
        <ThemeProvider theme={popupTheme}>
            <div className={styles.formBlock}>
                <div className={styles.detailsSection}>
                    <form onSubmit={handleSubmitOffer}>
                        <div className={styles.detailItem}>
                            <TextField 
                                type="text"
                                name='proposalName'
                                value={offer.proposalName}
                                onChange={handleOfferChange}
                                label='Наименование предложения' 
                                fullWidth
                                error={!!errors.proposalName}
                                helperText={errors.proposalName}
                            />
                        </div>
                        <div className={styles.detailItem}>
                            <TextField 
                                type="text"
                                name='description'
                                value={offer.description}
                                onChange={handleOfferChange}
                                label='Описание' 
                                fullWidth
                                multiline
                                sx={{
                                    '& input':{
                                        fontFamily: 'Montserrat'
                                    }
                                }}
                                rows={4}
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                        </div>
                        <div className={styles.detailItem}>
                            <Selector 
                                type="obj"
                                single={true} 
                                dict={objects}
                                onSelectionChange={(value) => handleSelectionChange('facility', value)}
                                label='Объект' 
                                fullWidth
                                error={!!errors.facility}
                                helperText={errors.facility}
                            />
                            <FormHelperText error={!!errors.facility}>{errors.facility}</FormHelperText>
                        </div>
                        <div className={styles.detailItem}>
                            <Selector 
                                type='social'
                                label='Социальный объект'
                                dict={socialObjects}
                                single={true} 
                                onSelectionChange={(value) => handleSelectionChange('socialFacility', value)}
                                error={!!errors.socialFacility}
                                helperText={errors.socialFacility}
                            />
                            <FormHelperText error={!!errors.socialFacility}>{errors.socialFacility}</FormHelperText>
                        </div>
                        <div className={styles.detailItem}>
                            <TextField 
                                type="text"
                                name='fullProposalPrice'
                                value={offer.fullProposalPrice}
                                onChange={handleOfferChange}
                                label='Стоимость, руб' 
                                fullWidth
                                error={!!errors.fullProposalPrice}
                                helperText={errors.fullProposalPrice}
                            />
                        </div>
                        <div className={styles.detailItem}>
                            <Button
                                            component="label"
                                            role={undefined}
                                            variant="contained"
                                            tabIndex={-1}
                                            endIcon={priceListFile ? null : <CloudUploadIcon />}
                                            sx={{
                                                color: '#333333',
                                                bgcolor: ' #f8f9fa',
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    bgcolor: '#005cb9c4',
                                                    color: '#fff',
                                                    border: '1px solid #f8f9fa',
                                                }
                                            }}
                                        >
                                            {priceListFile ? (
                                                <div className={styles.offerText}>
                                                    Файл прайс-листа: <div style={{fontWeight: 500}}>{priceListFile.name}</div>
                                                </div>
                                            ) : (
                                                <>Файл прайс-листа (файл excel)</>
                                            )}
                                            <VisuallyHiddenInput
                                                type="file"
                                                onChange={handlePriceListChange}
                                                accept=".xlsx, .xls"
                                            />
                                        </Button>
                        </div>
                    
                        <div className={styles.detailItem}>
                            <Button
                                type="submit"
                                sx={{
                                    color: '#f8f9fa',
                                    bgcolor: ' #005BB9',
                                    border: '1px solid #f8f9fa',
                                    borderRadius: '8px',
                                    maxWidth: '10em',
                                    height: '3em',
                                    '&:hover': {
                                        bgcolor: '#005cb9c4',
                                        color: '#fff',
                                        border: '1px solid #f8f9fa',
                                    }
                                }}
                            >
                                Создать
                            </Button>
                        </div>
                        
                    </form>
                </div>
            </div>
        </ThemeProvider>
    );
}

function DetailView({ cardData, onClose, contractor }) {
    const navigate = useNavigate();
    
    const handleGoToContractor = () => {
        // Перенаправляем пользователя на страницу подрядчика
        navigate(`/contractor/${cardData.contractorId}`);
        onClose();
    };
    
    return (
        <>
            <div className={styles.detailsSection}>
                <h3>Основная информация</h3>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ID проекта:</span>
                    <span>{cardData.proposalId}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Описание:</span>
                    <span>{cardData.description}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Объект:</span>
                    <span>{cardData.facility}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Социальный объект:</span>
                    <span>{cardData.socialFacility}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Стоимость проекта:</span>
                    <span className={styles.price}>{cardData.fullProposalPrice} руб</span>
                </div>
            </div>

            <div className={styles.detailsSection}>
                <h3>Подрядчик</h3>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Название:</span>
                    <span>{cardData.contractorName}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ИНН:</span>
                    <span>{cardData.contractorInn}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ОКВЭД:</span>
                    <span>{cardData.okvedCode}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>ID подрядчика:</span>
                    <span>{cardData.contractorId}</span>
                </div>
                {contractor ? (<></>) : (
                    <div className={styles.detailItem}>
                        <Button
                            onClick={handleGoToContractor}
                            sx={{
                                color: '#f8f9fa',
                                bgcolor: ' #005BB9',
                                border: '1px solid #f8f9fa',
                                borderRadius: '8px',
                                maxWidth: '10em',
                                height: '3em',
                                '&:hover': {
                                    bgcolor: '#005cb9c4',
                                    color: '#fff',
                                    border: '1px solid #f8f9fa',
                                }
                            }}
                        >
                            Подробнее
                        </Button>
                    </div>
                )}
            </div>

            <div className={styles.detailsSection}>
                <h3>Даты</h3>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Создано:</span>
                    <span>{formatDateTime(cardData.createdAt)}</span>
                </div>
                <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Обновлено:</span>
                    <span>{formatDateTime(cardData.updatedAt)}</span>
                </div>
            </div>

            {cardData.priceListFileUrl && (
                <div className={styles.detailsSection}>
                    <h3>Документы</h3>
                    <div className={styles.detailItem}>
                        <Link href={cardData.priceListFileUrl} target="_blank" rel="noopener noreferrer">
                            Прайс-лист
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

function ProjectDetailsPopup({ cardData, isOpen, onClose, contractor, create, contractorId }) {
    const handleSubmitOffer = (offerData) => {
        console.log("Отправляем предложение:", offerData);
        // Здесь можно добавить логику для отправки данных на сервер
    };
    
    if (!isOpen) return null;

    return createPortal(
        <div className={styles.popupOverlay} onClick={create ? null : onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.popupHeader}>
                    <h2>{create ? 'Новое предложение' : cardData.proposalName}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                
                <div className={styles.popupBody}>
                    <div className={styles.detailsGrid}>
                        {create ? (
                            <CreateForm 
                                onSubmit={handleSubmitOffer} 
                                onClose={onClose} 
                                contractorId={contractorId} 
                            />
                        ) : (
                            <DetailView 
                                cardData={cardData} 
                                onClose={onClose} 
                                contractor={contractor} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function OfferCardComponent({cardData, contractor, create, contractorId}) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleCardClick = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    };

    return(
        <>
            {create ? (
                <>
                    <IconButton onClick={handleCardClick} sx={{borderRadius: 0}} size="large">
                        <Add sx={{color: '#005BB9', fontSize: 30}} />
                    </IconButton>
                </>
            ) : (
                <>
                    <div className={styles.cardContainer} onClick={handleCardClick}>
                        <div className={styles.columnContainer}>
                            <div className={styles.column}>
                                <h3>{cardData.proposalName}</h3>
                                <div className={styles.mainText}>{cardData.description}</div>
                                <div className={styles.mainText}>Наименование подрядчика: {cardData.contractorName}</div> 
                                <div className={styles.mainText}>ОКВЭД: {cardData.okvedCode}</div> 
                                <div className={styles.mainText}>Создано: {formatDateTime(cardData.createdAt)}</div>
                            </div>
                            <div className={styles.price}>
                                <div>{cardData.fullProposalPrice}, руб</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <ProjectDetailsPopup 
                cardData={cardData}
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                contractor={contractor}
                create={create}
                contractorId={contractorId}
            />
        </>
    );
}