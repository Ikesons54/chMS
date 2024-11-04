import Joi from 'joi';

export const announcementValidation = {
  create: Joi.object({
    title: Joi.string()
      .required()
      .min(3)
      .max(100)
      .trim()
      .messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 100 characters'
      }),
    message: Joi.string()
      .required()
      .min(10)
      .max(1000)
      .trim()
      .messages({
        'string.empty': 'Message is required',
        'string.min': 'Message must be at least 10 characters long',
        'string.max': 'Message cannot exceed 1000 characters'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .default('medium')
      .messages({
        'any.only': 'Priority must be either low, medium, or high'
      }),
    expiresAt: Joi.date()
      .min('now')
      .optional()
      .messages({
        'date.min': 'Expiry date must be in the future'
      })
  })
}; 