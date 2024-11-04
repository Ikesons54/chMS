import * as Joi from 'joi';

export const userValidation = {
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).trim(),
    lastName: Joi.string().min(2).max(50).trim(),
    phoneNumber: Joi.string()
      .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
  }),

  deleteAccount: Joi.object({
    password: Joi.string().required().messages({
      'string.empty': 'Password is required to delete account',
    }),
  }),
}; 