const passport = require('passport');
const ErrorResponse = require('../utils/errorResponse');

exports.protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(new ErrorResponse('Server error during authentication', 500));
    }

    if (!user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    req.user = user;
    next();
  })(req, res, next);
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Google OAuth authentication
exports.googleAuth = passport.authenticate('google', { session: false });

// Google OAuth callback handling
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return next(new ErrorResponse('Server error during Google authentication', 500));
    }

    if (!user) {
      return next(new ErrorResponse('Google authentication failed', 401));
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`);
  })(req, res, next);
}; 