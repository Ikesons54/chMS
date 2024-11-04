import Joi from 'joi';
import { DonationType } from '../models/Donation';

export const donationValidation = {
  create: Joi.object({
    donorId: Joi.string().optional(),
    type: Joi.string()
      .valid(...Object.values(DonationType))
      .required()
      .messages({
        'any.required': 'Donation type is required',
        'any.only': 'Please select a valid donation type'
      }),
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required'
      }),
    notes: Joi.string().optional(),
    
    // Tithe specific validation
    titheDetails: Joi.when('type', {
      is: DonationType.TITHE,
      then: Joi.object({
        personPaying: Joi.string()
          .required()
          .messages({
            'any.required': 'Person paying the tithe is required'
          }),
        titheOwner: Joi.string()
          .required()
          .messages({
            'any.required': 'Tithe owner name is required'
          }),
        month: Joi.string()
          .optional()
          .valid(
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
          ),
        year: Joi.number()
          .optional()
          .min(2000)
          .max(new Date().getFullYear())
      }).required(),
      otherwise: Joi.optional()
    }),

    // Other category validation
    otherCategoryDetails: Joi.when('type', {
      is: DonationType.OTHER,
      then: Joi.object({
        categoryName: Joi.string()
          .required()
          .messages({
            'any.required': 'Category name is required for other donations'
          }),
        description: Joi.string().optional()
      }).required(),
      otherwise: Joi.optional()
    })
  })
}; 