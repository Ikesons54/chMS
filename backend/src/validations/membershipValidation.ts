import Joi from 'joi';
import { NATIONALITIES } from '../constants/nationalities';
import { 
  Gender, 
  MaritalStatus, 
  MinistryDepartments 
} from '../models/MembershipApplication';

export const membershipValidation = {
  create: Joi.object({
    gender: Joi.string()
      .valid(...Object.values(Gender))
      .required()
      .messages({
        'any.required': 'Gender is required',
        'any.only': 'Please select a valid gender'
      }),
    middleName: Joi.string().trim().optional(),
    birthday: Joi.object({
      day: Joi.number().min(1).max(31).required()
        .messages({
          'number.base': 'Day must be a number',
          'number.min': 'Day must be at least 1',
          'number.max': 'Day cannot be more than 31',
          'any.required': 'Day is required'
        }),
      month: Joi.number().min(1).max(12).required()
        .messages({
          'number.base': 'Month must be a number',
          'number.min': 'Month must be at least 1',
          'number.max': 'Month cannot be more than 12',
          'any.required': 'Month is required'
        })
    }).required(),
    nationality: Joi.string()
      .valid(...NATIONALITIES)
      .required()
      .messages({
        'any.required': 'Nationality is required',
        'any.only': 'Please select a valid nationality'
      }),
    maritalStatus: Joi.string()
      .valid(...Object.values(MaritalStatus))
      .required()
      .messages({
        'any.required': 'Marital status is required',
        'any.only': 'Please select a valid marital status'
      }),
    spouseFullName: Joi.string()
      .when('maritalStatus', {
        is: MaritalStatus.MARRIED,
        then: Joi.string().required().trim(),
        otherwise: Joi.string().optional()
      })
      .messages({
        'any.required': 'Spouse name is required when married'
      }),
    residentialAddress: Joi.object({
      area: Joi.string().required().trim(),
      city: Joi.string().required().trim(),
      country: Joi.string().required().trim(),
      poBox: Joi.string().trim().optional()
    }).required(),
    phoneNumber: Joi.string()
      .required()
      .trim()
      .messages({
        'any.required': 'Phone number is required'
      }),
    whatsappNumber: Joi.string()
      .trim()
      .optional(),
    emergencyContact: Joi.object({
      name: Joi.string().required().trim(),
      relationship: Joi.string().required().trim(),
      phone: Joi.string().required().trim()
    }).required(),
    dateOfJoining: Joi.object({
      month: Joi.number().min(1).max(12),
      year: Joi.number().min(1900).max(new Date().getFullYear())
    }).optional(),
    salvationExperience: Joi.object({
      isSaved: Joi.boolean().required(),
      dateOfSalvation: Joi.date().when('isSaved', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      testimony: Joi.string().when('isSaved', {
        is: true,
        then: Joi.string().required().min(50),
        otherwise: Joi.optional()
      })
    }).required(),
    waterBaptism: Joi.object({
      isBaptized: Joi.boolean().required(),
      date: Joi.date().when('isBaptized', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      place: Joi.string().when('isBaptized', {
        is: true,
        then: Joi.string().required().trim(),
        otherwise: Joi.optional()
      }),
      minister: Joi.string().when('isBaptized', {
        is: true,
        then: Joi.string().required().trim(),
        otherwise: Joi.optional()
      })
    }).required(),
    holyGhostBaptism: Joi.object({
      isBaptized: Joi.boolean().required(),
      date: Joi.date().when('isBaptized', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      speakingInTongues: Joi.boolean().when('isBaptized', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    }).required(),
    attendanceFrequency: Joi.string()
      .valid('regular', 'occasional', 'new')
      .required()
      .messages({
        'any.required': 'Attendance frequency is required',
        'any.only': 'Please select a valid attendance frequency'
      }),
    ministryInterests: Joi.array()
      .items(Joi.string().valid(...Object.values(MinistryDepartments)))
      .min(1)
      .required()
      .messages({
        'array.min': 'Please select at least one ministry interest',
        'any.only': 'Please select valid ministry departments'
      }),
    currentMinistryInvolvement: Joi.array()
      .items(Joi.string().valid(...Object.values(MinistryDepartments)))
      .optional(),
    spiritualGifts: Joi.array()
      .items(Joi.string().trim())
      .optional(),
    specialSkills: Joi.array()
      .items(Joi.string().trim())
      .optional(),
    occupation: Joi.string()
      .trim()
      .optional(),
    prayer_requests: Joi.array()
      .items(Joi.string().trim())
      .optional(),
    documents: Joi.object({
      baptismCertificate: Joi.string().optional(),
      marriageCertificate: Joi.string().when('maritalStatus', {
        is: MaritalStatus.MARRIED,
        then: Joi.string().required(),
        otherwise: Joi.optional()
      }),
      otherDocuments: Joi.array().items(Joi.string()).optional()
    }).optional()
  })
}; 