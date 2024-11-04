import Joi from 'joi';
import { UserRole } from '../models/User';

export const roleValidation = {
  updateRole: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'any.required': 'User ID is required',
        'string.empty': 'User ID cannot be empty'
      }),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required()
      .messages({
        'any.required': 'Role is required',
        'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
        'string.empty': 'Role cannot be empty'
      }),
    ministry: Joi.array()
      .items(Joi.string().trim())
      .when('role', {
        is: Joi.valid(UserRole.DEACON, UserRole.DEACONESS, UserRole.ELDER),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'Ministry is required for this role'
      })
  })
}; 