import { Autocomplete, TextField } from '@mui/material';

const socialObjects = {
  'Все виды': '',
  'Школа': 'Школа',
  'Поликлиника': 'Поликлиника',
  'Больница': 'Больница',
  'Детский сад': 'Детский сад'
};

const SocialObjectSelect = ({ value, onChange, label = "Социальные объекты" }) => {
  const options = Object.entries(socialObjects).map(([label, value]) => ({
    label,
    value
  }));

  const selectedOption = options.find(option => option.value === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      value={selectedOption}
      onChange={(event, newValue) => {
        onChange(newValue ? newValue.value : 0);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          fullWidth
        />
      )}
      sx={{
        minWidth: 250,
        '& .MuiAutocomplete-inputRoot': {
          paddingRight: '28px !important'
        }
      }}
    />
  );
};

export default SocialObjectSelect;