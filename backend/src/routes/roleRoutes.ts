import express from 'express';
import { updateUserRole, getUsersByRole } from '../controllers/roleController';
import { protect } from '../middleware/authMiddleware';
import { hasRole } from '../middleware/roleMiddleware';
import { UserRole } from '../models/User';
import { validateRequest } from '../middleware/validateRequest';
import { roleValidation } from '../validations/roleValidation';

const router = express.Router();

// Protect all routes
router.use(protect);

// Only admin can manage roles
router.use(hasRole([UserRole.ADMIN]));

router.patch(
  '/update-role',
  validateRequest(roleValidation.updateRole),
  updateUserRole
);

router.get('/users/:role', getUsersByRole);

export default router; 