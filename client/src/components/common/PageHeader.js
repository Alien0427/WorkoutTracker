import React from 'react';
import { Typography, Box, Breadcrumbs, Link, Divider, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader component for consistent page headers across the application
 * 
 * @param {Object} props
 * @param {string} props.title - The main title for the page
 * @param {string} [props.subtitle] - Optional subtitle or description for the page
 * @param {React.ReactNode} [props.icon] - Optional icon to display next to the title
 * @param {Array} [props.breadcrumbs] - Optional breadcrumbs array of {label, path} objects
 * @param {React.ReactNode} [props.action] - Optional action component (button, etc.)
 * @param {boolean} [props.backButton] - Whether to show a back button
 * @param {string} [props.backPath] - Path to navigate to when back button is clicked (if not provided, will use browser history)
 */
const PageHeader = ({
  title,
  subtitle,
  icon,
  breadcrumbs,
  action,
  backButton = false,
  backPath,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={crumb.path}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
            >
              {crumb.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: subtitle ? 1 : 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {backButton && (
            <IconButton 
              onClick={handleBack} 
              sx={{ mr: 1 }}
              aria-label="go back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && <Box sx={{ mr: 1, display: 'flex' }}>{icon}</Box>}
            <Typography variant="h4" component="h1" fontWeight="500">
              {title}
            </Typography>
          </Box>
        </Box>

        {action && (
          <Box>
            {action}
          </Box>
        )}
      </Box>

      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {subtitle}
        </Typography>
      )}
      
      <Divider sx={{ mb: 3 }} />
    </motion.div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
  action: PropTypes.node,
  backButton: PropTypes.bool,
  backPath: PropTypes.string,
};

export default PageHeader; 