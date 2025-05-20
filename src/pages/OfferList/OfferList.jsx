import styles from './OfferList.module.css'
import { Box, Button, TextField, Stack, Popover, IconButton, CircularProgress } from '@mui/material';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckIcon from '@mui/icons-material/Check';
import logo from '../../assets/logo-white.png'
import Selector from '../../components/Selector.jsx';
import SocialObjectSelect from '../../components/SocialObjectsSelect.jsx';
import OfferCardComponent from '../../components/OfferCardComponent.jsx';
import okvedDictionary from '../../data/okved.jsx';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

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

const API_URL = 'http://localhost:8080/proposal-service/proposal/list';

const postData = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export default function OfferList(){
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [anchorEl, setAnchorEl] = useState(null);
    const [isFullWidth, setIsFullWidth] = useState(true);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);
    const observer = useRef();

    const navigate = useNavigate();

    const [filterData, setFilterData] = useState({
        "proposalId": '',
        "proposalName": '',
        "contractorId": '',
        "contractorName": '',
        "contractorInn": '',
        "contractNumber": '',
        "facilities": [],
        "socialFacilities": [],
        "okvedCodes": [],
        "period": {
            "from": null,
            "to": null
        },
        "priceRange": {
            "min": null,
            "max": null
        },
        "afterId": '',
        "limit": 10
    });

    const fetchProposals = async (isInitialLoad = false) => {
        try {
            setLoading(true);
            setError(null);
            
            const requestData = { ...filterData };
            if (isInitialLoad) {
                requestData.afterId = '';
                setProposals([]);
            }
            
            const response = await postData(API_URL, requestData);
            
            if (response && response.proposals) {
                setProposals(prevProposals => 
                    isInitialLoad ? response.proposals : [...prevProposals, ...response.proposals]
                );
                setHasMore(response.pageInfo?.hasMore || false);
                
                if (response.pageInfo?.afterId) {
                    setFilterData(prev => ({
                        ...prev,
                        afterId: response.pageInfo.afterId
                    }));
                }
            }
        } catch (err) {
            setError('Failed to load proposals. Please try again.');
            console.error('Error fetching proposals:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const currentDate = new Date();
        const from = currentDate.toISOString();
        const to = currentDate.toISOString();
        setFilterData(prev => ({
            ...prev,
            period: { from, to }
        }));
    }, [])

    const handleButtonClick = (period, event) => {
        setSelectedPeriod(period);
        
        const currentDate = new Date();
        let from, to;
        
        switch (period) {
            case 'today':
                from = currentDate.toISOString();
                to = currentDate.toISOString();
                break;
            case 'month':
                from = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
                to = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
                break;
            case 'custom':
                if (event) {
                    setAnchorEl(event.currentTarget);
                }
                return;
            default:
                return;
        }
        
        setFilterData(prev => ({
            ...prev,
            period: { from, to }
        }));
        
        setAnchorEl(null);4
    };

    const handleClose = () => {
        if (startDate && endDate) {
            setFilterData(prev => ({
                ...prev,
                period: {
                    from: startDate.toISOString(),
                    to: endDate.toISOString()
                }
            }));
        }
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'date-range-popover' : undefined;

    const getPeriodText = () => {
        switch (selectedPeriod) {
        case 'today':
            return `${format(new Date(), 'dd.MM.yyyy')}`;
        case 'month':
            return `${format(new Date(), 'MMMM yyyy')}`;
        case 'custom':
            return `${format(startDate || new Date(), 'dd.MM.yyyy')} – ${format(endDate || new Date(), 'dd.MM.yyyy')}`;
        default:
            return '';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const checkPrice = (min, max) => {
        if (min !== '' || max !== ''){
            if (parseInt(min) > parseInt(max)){
                setFilterData(prev => ({
                    ...prev,
                    priceRange: {
                        ...prev.priceRange,
                        ['min']: parseInt(min),
                        ['max']: parseInt(min),
                    }
                }));
            }
        }
    }

    const handlePriceChange = (type) => (e) => {
        const { value } = e.target;
        setFilterData(prev => ({
            ...prev,
            priceRange: {
                ...prev.priceRange,
                [type]: value
            }
        }));
    };

    const handleOkvedChange = (selectedCodes) => {
        setFilterData(prev => ({
            ...prev,
            okvedCodes: selectedCodes
        }));
    };

    const handleSocialObjectChange = (value) => {
        setFilterData(prev => ({
            ...prev,
            socialFacilities: value
        }));
    };

    const handleChangeSize = (e) => {
        setIsFullWidth(!isFullWidth);
    }

    const handleSubmit = (e) => {
        checkPrice(filterData.priceRange.min, filterData.priceRange.max);
        setIsFullWidth(false);
        fetchProposals(true);
        console.log(filterData);
    }

    const handleGoToDashboard = (e) => {
        const idadm = localStorage.getItem('adminId');
        navigate(`/dashboard/admin/${idadm}`);
    }

    // Setup intersection observer for infinite scrolling
    const lastProposalElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProposals(false); // Load more data
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return(
        <>
            <div className={styles.mainContainer}>
                <div className={`${styles.filterFormContainer} ${isFullWidth ? styles.isfullwidth : ''}`}>
                    <div className={styles.toolbar}>
                        <div className={styles.dashboardButton}>
                            <Button 
                                onClick={handleGoToDashboard}
                                startIcon={<PersonIcon sx={{color: '#fff', height: '0.75em', width: '0.75em'}} />}
                                sx={{
                                    height: '1em',
                                    borderRadius: '8px',
                                }}
                            >
                                <span className={styles.label} style={{fontSize: '12px', marginBottom: 0}}>Личный кабинет</span>
                            </Button>
                        </div>
                        <div className={styles.logoContainer}>
                            <img src={logo} alt="" className={styles.logoWhite} />
                        </div>
                    </div>
                    <div className={`${styles.headerContainer} ${isFullWidth ? styles.fullwidth : ''}`}>
                        <h1>Найти предложения</h1>
                        <div className={styles.iconButton1}>
                            {isFullWidth ? (
                                <Button 
                                    sx={{
                                        backgroundColor: 'white',
                                        color: '#005BB9',
                                        height: '40px',
                                        width: '140px',
                                        borderRadius: '2em',
                                        textTransform: 'none', 
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.58)',
                                        color: '#005BB9',
                                        },
                                        '&:active': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                        },
                                        padding: '8px 16px',
                                        fontWeight: 600, 
                                        boxShadow: 'none', 
                                        '&:disabled': {
                                        cursor: 'none',
                                        backgroundColor: 'rgba(255, 255, 255, 0.58)',
                                        color: '#005BB9'
                                        },
                                    }}
                                    onClick={handleSubmit}
                                    disabled={!isFullWidth}
                                >
                                    Применить
                                </Button>
                            ) : (
                                <IconButton className={styles.arrowButton} onClick={handleSubmit}>
                                    <CheckIcon sx={{color: '#fff'}}></CheckIcon>
                                </IconButton>
                            )}
                        </div>
                        <div className={`${styles.iconButton} ${isFullWidth ? styles.rotated : ''}`}>
                            <IconButton onClick={handleChangeSize}>
                                <ArrowForwardIosIcon sx={{color: '#fff'}}></ArrowForwardIosIcon>
                            </IconButton>
                        </div>
                    </div>
                    <div className={styles.formContainer}>
                    <div className={`${styles.form} ${isFullWidth ? styles.isfullwidth : ''}`}>
                        <div className={styles.formBlock}>
                            <div className={styles.input}>
                                <TextField 
                                    type="text"
                                    name='proposalId'
                                    value={filterData.proposalId}
                                    onChange={handleInputChange}
                                    label='Идентификатор предложения' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.input}>
                                <TextField 
                                    type="text"
                                    name='contractorName'
                                    value={filterData.contractorName}
                                    onChange={handleInputChange}
                                    label='Наименование подрядчика' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.input}>
                                <TextField 
                                    type="text"
                                    name='contractorInn'
                                    value={filterData.contractorInn}
                                    onChange={handleInputChange}
                                    label='ИНН подрядчика' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.input}>
                                <TextField 
                                    type="text"
                                    name='proposalName'
                                    value={filterData.proposalName}
                                    onChange={handleInputChange}
                                    label='Наименование предложения' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.inputSeparateConatainer}>
                                <div className={styles.label}>Стоимость, руб</div>
                                <div className={styles.inputSeparate}>
                                    <TextField 
                                        type="number"
                                        name='priceMin'
                                        value={filterData.priceRange.min}
                                        placeholder='От'
                                        onChange={handlePriceChange('min')}
                                        sx={{
                                            '& input[type="number"]': {
                                            MozAppearance: 'textfield',
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            },
                                        }}
                                    />
                                    <div className={styles.dash}>—</div>
                                    <TextField 
                                        type="number"
                                        name='priceMax'
                                        value={filterData.priceRange.max}
                                        placeholder='До'
                                        onChange={handlePriceChange('max')}
                                        sx={{
                                            '& input[type="number"]': {
                                            MozAppearance: 'textfield',
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            
                        </div>
                        <div className={styles.formBlock}>
                            <div className={styles.input}>
                                <Selector 
                                    type="obj"
                                    single={false} 
                                    dict={objects}
                                    onSelectionChange={(e) => {
                                        setFilterData(prev => ({
                                            ...prev,
                                            facilities: e
                                        }));
                                    }}
                                    label='Объект' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.input}>
                                <Selector 
                                    type='okved'
                                    dict={okvedDictionary}
                                    single={false} 
                                    label='ОКВЭД'
                                    onSelectionChange={handleOkvedChange}
                                    selectedCodes={filterData.okvedCodes}
                                />
                            </div>
                            <div className={styles.input}>
                                <Selector 
                                    type='social'
                                    label='Социальные объекты'
                                    dict={socialObjects}
                                    single={false} 
                                    onSelectionChange={handleSocialObjectChange}
                                />
                            </div>
                            <div className={styles.input}>
                                <TextField 
                                    type="text"
                                    name='contractNumber'
                                    value={filterData.contractNumber}
                                    onChange={handleInputChange}
                                    label='Номер договора' 
                                    fullWidth
                                />
                            </div>
                            <div className={styles.inputSeparateConatainer}>
                                <div className={styles.label}>Период: {getPeriodText()}</div>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <Box>
                                                <div className={styles.inputDate}>
                                                    <Button 
                                                    onClick={() => handleButtonClick('today')}
                                                    sx={selectedPeriod === 'today' ? {border: '1px solid #fff', color: '#fff'} : 'inherit'}
                                                    >
                                                    Сегодня
                                                    </Button>
                                                    <Button 
                                                    onClick={() => handleButtonClick('month')}
                                                    sx={selectedPeriod === 'month' ? {border: '1px solid #fff', color: '#fff'} : 'inherit'}
                                                    >
                                                    Текущий месяц
                                                    </Button>
                                                    <Button 
                                                    onClick={(e) => handleButtonClick('custom', e)}
                                                    sx={selectedPeriod === 'custom' ? {border: '1px solid #fff', color: '#fff'} : 'inherit'}
                                                    >
                                                    Свой период
                                                    </Button>
                                                </div>

                                            <Popover
                                            id={id}
                                            open={open}
                                            anchorEl={anchorEl}
                                            onClose={handleClose}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'left',
                                            }}
                                            >
                                            <Box sx={{ p: 2, minWidth: 300, zIndex: '99' }}>
                                                <Stack spacing={3} sx={{zIndex: '-1' }}>
                                                <DatePicker
                                                    label="Дата начала"
                                                    value={startDate}
                                                    onChange={(newValue) => setStartDate(newValue)}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                    slotProps={{
                                                        popper: {
                                                        sx: {
                                                            zIndex: 999999, 
                                                        },
                                                        },
                                                    }}
                                                />
                                                <DatePicker
                                                    label="Дата окончания"
                                                    value={endDate}
                                                    onChange={(newValue) => setEndDate(newValue)}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                    minDate={startDate}
                                                    slotProps={{
                                                        popper: {
                                                        sx: {
                                                            zIndex: 999999,
                                                        },
                                                        },
                                                    }}
                                                />
                                                <Button 
                                                    variant="contained" 
                                                    onClick={handleClose}
                                                    disabled={!startDate || !endDate}
                                                    sx={{color: '#fff', bgcolor: '#005BB9'}}
                                                >
                                                    Готово
                                                </Button>
                                                </Stack>
                                            </Box>
                                            </Popover>
                                        </Box>
                                    </LocalizationProvider>
                                </div>
                            </div>    
                        </div>
                    </div>
                </div>
                <div className={styles.offerListContainer}>
                    {proposals.length > 0 ? (
                        proposals.map((proposal, index) => {
                            if (proposals.length === index + 1) {
                                return (
                                    <div ref={lastProposalElementRef} key={proposal.proposalId}>
                                        <OfferCardComponent contractor={false} cardData={proposal} />
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={proposal.proposalId}>
                                        <OfferCardComponent contractor={false} cardData={proposal} />
                                    </div>
                                );
                            }
                        })
                    ) : (
                        !loading && <div className={styles.noResults}>Нет предложений для отображения</div>
                    )}
                    
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <p>Загрузка предложений...</p>
                            <div className={styles.loadingIcon}><CircularProgress size={40} /></div>
                        </div>
                    )}
                    
                    {error && (
                        <div className={styles.errorContainer}>
                            <p>{error}</p>
                            <Button 
                                variant="contained" 
                                onClick={() => fetchProposals(true)}
                                sx={{color: '#fff', bgcolor: '#005BB9', mt: 2}}
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}