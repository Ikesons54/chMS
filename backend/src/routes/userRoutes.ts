import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteAccount,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { userValidation } from '../validations/userValidation';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/profile', getProfile);
router.patch(
  '/profile',
  validateRequest(userValidation.updateProfile),
  updateProfile
);
router.post(
  '/profile/picture',
  upload.single('profilePicture'),
  uploadProfilePicture
);
router.delete(
  '/account',
  validateRequest(userValidation.deleteAccount),
  deleteAccount
);

export default router; 