import { z } from 'zod'

// Company validation
export const companySchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  industry: z.string()
    .min(1, 'Please select an industry'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+'], {
    required_error: 'Please select company size'
  }),
  budget: z.enum(['under-10k', '10k-50k', '50k-100k', '100k-250k', '250k-plus'], {
    required_error: 'Please select budget range'
  }),
  founded: z.string().optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
})

// Location validation
export const locationSchema = z.object({
  city: z.string()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name must be less than 100 characters'),
  state: z.string()
    .length(2, 'Please select a valid state')
})

// Strategy validation
export const strategySchema = z.object({
  primary: z.enum([
    'compliance', 'talent', 'fundraising', 'product', 'go-to-market', 'partnerships'
  ], {
    required_error: 'Please select a primary focus area'
  }),
  secondary: z.array(z.string()).min(1, 'Select at least one secondary focus'),
  timeline: z.enum(['3-months', '6-months', '12-months'], {
    required_error: 'Please select a timeline'
  }),
  concerns: z.string()
    .min(10, 'Please describe your concerns in at least 10 characters')
    .max(1000, 'Concerns must be less than 1000 characters'),
  goals: z.string()
    .min(10, 'Please describe your goals in at least 10 characters')
    .max(1000, 'Goals must be less than 1000 characters')
})

// Complete report validation
export const reportRequestSchema = z.object({
  company: companySchema,
  location: locationSchema,
  strategy: strategySchema
})

export type CompanyFormData = z.infer<typeof companySchema>
export type LocationFormData = z.infer<typeof locationSchema>
export type StrategyFormData = z.infer<typeof strategySchema>
export type ReportRequestFormData = z.infer<typeof reportRequestSchema>