import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * LoadingButton component for displaying a button with loading state
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {React.ReactNode} props.children - Button label/content
 * @param {string} props.color - Button color (primary, secondary, success, error, etc.)
 * @param {string} props.variant - Button variant (contained, outlined, text)
 * @param {function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Object} props.sx - Custom styles for the button
 * @param {string} props.size - Button size (small, medium, large)
 */
const LoadingButton = ({
  loading = false,
  children,
  color = 'primary',
  variant = 'contained',
  onClick,
  type = 'button',
  disabled = false,
  sx = {},
  size = 'medium',
  ...rest
}) => {
  return (
    <Button
      color={color}
      variant={variant}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      sx={{
        position: 'relative',
        ...sx
      }}
      size={size}
      {...rest}
    >
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            color: 'inherit',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </Button>
  );
};

LoadingButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  variant: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
  size: PropTypes.string
};

export default LoadingButton; 