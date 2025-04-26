import React from 'react';
import { 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Slider,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const FormField = ({
  field,
  value,
  onChange,
  error,
  showPassword,
  toggleShowPassword,
  options,
  multiple,
  disabled,
  fullWidth = true,
  required = false,
  min,
  max,
  step,
  adornment,
  adornmentPosition = 'end',
  onBlur,
  multiline,
  rows,
  autoFocus
}) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <TextField
          label={field.label}
          name={field.name}
          type={field.type}
          value={value}
          onChange={onChange}
          error={!!error}
          helperText={error}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          InputProps={adornment ? {
            [adornmentPosition + 'Adornment']: (
              <InputAdornment position={adornmentPosition}>
                {adornment}
              </InputAdornment>
            )
          } : undefined}
          multiline={multiline}
          rows={rows}
          onBlur={onBlur}
          autoFocus={autoFocus}
          inputProps={{ min, max, step }}
        />
      );
      
    case 'password':
      return (
        <TextField
          label={field.label}
          name={field.name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          error={!!error}
          helperText={error}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShowPassword}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          onBlur={onBlur}
        />
      );
      
    case 'select':
      return (
        <FormControl 
          fullWidth={fullWidth} 
          error={!!error} 
          required={required}
          disabled={disabled}
        >
          <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
          <Select
            labelId={`${field.name}-label`}
            name={field.name}
            value={value}
            onChange={onChange}
            multiple={multiple}
            onBlur={onBlur}
          >
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );
      
    case 'checkbox':
      return (
        <FormControlLabel
          control={
            <Checkbox
              name={field.name}
              checked={!!value}
              onChange={onChange}
              disabled={disabled}
              onBlur={onBlur}
            />
          }
          label={field.label}
        />
      );
      
    case 'textarea':
      return (
        <TextField
          label={field.label}
          name={field.name}
          value={value}
          onChange={onChange}
          error={!!error}
          helperText={error}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
          multiline
          rows={rows || 4}
          onBlur={onBlur}
        />
      );
      
    case 'slider':
      return (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <Typography gutterBottom>{field.label}</Typography>
          <Slider
            name={field.name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            valueLabelDisplay="auto"
            marks={options}
            onBlur={onBlur}
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      );
      
    default:
      return null;
  }
};

export default FormField; 