import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  Typography,
  FormControl
} from '@mui/material';

const Selector = ({ single, onSelectionChange, dict, type, label, defaultValue, disabled = false }) => {
  const [selected, setSelected] = useState(single ? null : []);
  const [inputValue, setInputValue] = useState('');

  const options = Object.entries(dict).map(([code, name]) => ({
    id: code,
    code,
    name: type === 'okved' ? `${code} - ${name}` : name
  }));

  // Эффект для установки значения по умолчанию
  useEffect(() => {
    if (defaultValue) {
      if (single) {
        // Для одиночного выбора
        const defaultOption = options.find(opt => opt.code === defaultValue);
        if (defaultOption) {
          setSelected(defaultOption);
        }
      } else {
        // Для множественного выбора
        const defaultOptions = options.filter(opt => 
          Array.isArray(defaultValue) ? 
          defaultValue.includes(opt.code) : 
          opt.code === defaultValue
        );
        setSelected(defaultOptions);
      }
    }
  }, [defaultValue, dict]); // Зависимость от dict чтобы сработало после загрузки данных

  const handleChange = (event, newValue) => {
    if (disabled) return; // Блокируем изменение при disabled
    setSelected(newValue);
    if (single) {
      onSelectionChange?.(newValue?.code || null);
    } else {
      onSelectionChange?.(newValue.map(item => item.code));
    }
  };

  return (
    <FormControl fullWidth>
      <Autocomplete
        multiple={!single}
        options={options}
        getOptionLabel={(option) => option.name}
        value={selected}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={type === 'okved' ? "Введите номер или название" : 'Введите название'}
            disabled={disabled}
            sx={{
              '& .Mui-disabled .MuiAutocomplete-popupIndicator': {
                display: 'none'
              }
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              label={option.code}
              sx={{ 
                margin: '2px', 
                fontFamily: 'Montserrat', 
                fontWeight: 600,
                opacity: disabled ? 0.7 : 1 // Небольшое визуальное отличие для disabled
              }}
              onDelete={disabled ? undefined : getTagProps({ index }).onDelete} // Отключаем удаление при disabled
            />
          ))
        }
        renderOption={(props, option) => {
          const { key, ...restProps } = props;
          return (
            <li key={key} {...restProps}>
              <Typography variant="body2" style={{fontFamily: '"Montserrat", sans-serif', zIndex: '999999999999999999999000 !important'}}>
                {type === 'okved' ? (
                  <>
                  <strong>{option.code}</strong> - {option.name.split(' - ')[1]}
                  </>
                ) : (
                  <>
                  {option.name}
                  </>
                ) }
              </Typography>
            </li>
          );
        }}
        filterOptions={(options, state) => {
          if (disabled) return []; // Не показываем варианты при disabled
          const input = state.inputValue.toLowerCase();
          return options
            .filter(option =>
              option.code.toLowerCase().includes(input) ||
              option.name.toLowerCase().includes(input)
            ).slice(0, 50);
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText={disabled ? "" : "Ничего не найдено"} // Скрываем текст при disabled
        limitTags={5}
        disabled={disabled}
        readOnly={disabled}
      />
    </FormControl>
  );
};

export default Selector;