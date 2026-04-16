import { z } from 'zod';

export const employeeProfileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.'),
  dateOfBirth: z.string().min(1, 'Date of birth is required.'),
  email: z.string().email('Please enter a valid email address.'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits.')
    .max(20, 'Phone number is too long.'),
  additionalPhoneNumber: z
    .string()
    .max(20, 'Additional phone number is too long.')
    .optional(),
  city: z.string().min(1, 'City is required.'),
  countryOfBirth: z.string().min(1, 'Country is required.'),
  offerLetterUpload: z.string().optional(),
  offerLetterSource: z.string().optional(),
  department: z.string().min(1, 'Please select a department.'),
  reportingTo: z.string().optional(),
  rolePosition: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required.'),
  annualSalary: z
    .string()
    .min(1, 'Annual salary is required.')
    .regex(/^\d[\d,]*$/, 'Use numbers only.'),
  probationPeriod: z.string().min(1, 'Probation period is required.'),
  compensationNotes: z
    .string()
    .max(400, 'Notes must be 400 characters or less.')
    .optional(),
  awashBankAccountName: z
    .string()
    .min(2, 'Awash bank account name is required.'),
  awashBankAccountNumber: z
    .string()
    .min(6, 'Awash account number is required.'),
  dashenBankAccountName: z.string().optional(),
  dashenBankAccountNumber: z.string().optional(),
  kpiTarget1: z.string().optional(),
  kpiTarget2: z.string().optional(),
  kpiTarget3: z.string().optional(),
  okrTarget1: z.string().optional(),
  okrTarget2: z.string().optional(),
  assetResponsibleFor: z.string().optional(),
  laptopModel: z.string().optional(),
  serialNumber: z.string().optional(),
  credentialResponsibleFor: z.string().optional(),
  credentialType1: z.string().optional(),
  credentialType2: z.string().optional(),
  faydaIdDocument: z.string().min(1, 'Fayda ID document is required.'),
  experienceCertificate: z.string().optional(),
  educationalDocument: z.string().min(1, 'Educational document is required.'),
  recommendationLetters: z.string().optional(),
  emergencyFirstName: z
    .string()
    .min(2, 'Emergency contact first name is required.'),
  emergencyLastName: z
    .string()
    .min(2, 'Emergency contact last name is required.'),
  emergencyRelationship: z.string().min(1, 'Relationship is required.'),
  emergencyPhoneNumber: z
    .string()
    .min(10, 'Emergency phone number is required.'),
  emergencyEmail: z
    .string()
    .email('Please enter a valid email.')
    .optional()
    .or(z.literal('')),
  emergencyCity: z.string().optional(),
  emergencyCountryOfBirth: z.string().optional(),
});

export type EmployeeProfileFormValues = z.infer<
  typeof employeeProfileFormSchema
>;
