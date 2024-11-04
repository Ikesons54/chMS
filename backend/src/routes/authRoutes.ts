import express from 'express';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  updatePassword,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { authValidation } from '../validations/authValidation';

const router = express.Router();

// Public routes
router.post(
  '/register', 
  validateRequest(authValidation.register), 
  register
);

router.post(
  '/login', 
  validateRequest(authValidation.login), 
  login
);

router.get(
  '/verify-email/:token', 
  verifyEmail
);

router.post(
  '/forgot-password',
  validateRequest(authValidation.forgotPassword),
  forgotPassword
);

router.post(
  '/reset-password/:token',
  validateRequest(authValidation.resetPassword),
  resetPassword
);

router.post(
  '/refresh-token', 
  refreshToken
);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

router.post(
  '/update-password',
  validateRequest(authValidation.updatePassword),
  updatePassword
);

router.post(
  '/logout', 
  logout
);

export default router; 