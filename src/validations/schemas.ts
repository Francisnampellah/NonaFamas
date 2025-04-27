import Joi from 'joi';
import { UserRole } from '@prisma/client';

// Auth Schemas
export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid('patient', 'doctor', 'pharmacist', 'admin').required()
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

// Medicine Schema
export const medicineSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  manufacturer: Joi.alternatives().try(
    Joi.string().min(2).max(50),
    Joi.number().integer().positive()
  ).required(),
  unit: Joi.alternatives().try(
    Joi.string().min(2).max(50),
    Joi.number().integer().positive()
  ).required(),
  category: Joi.alternatives().try(
    Joi.string().min(2).max(50),
    Joi.number().integer().positive()
  ).required(),
  sellPrice: Joi.number().required().positive().precision(2)
});

// Manufacturer Schema
export const manufacturerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50)
});

// Unit Schema
export const unitSchema = Joi.object({
  name: Joi.string().required().min(2).max(50)
});

// Category Schema
export const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(50)
});

// Supplier Schema
export const supplierSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  contact: Joi.string().min(10).max(20).optional()
});

// Purchase Schema
export const purchaseSchema = Joi.object({
  medicineId: Joi.number().integer().positive().required(),
  batchId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive().required(),
  userId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  costPerUnit: Joi.number().positive().precision(2).required()
});

// Stock Schemas
export const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required()
});

export const stockAdjustmentSchema = Joi.object({
  adjustment: Joi.number().integer().required()
}); 