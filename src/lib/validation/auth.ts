import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone number is required')
  .max(30)
  .regex(/^[\d\s\-+().]+$/, 'Use digits and common phone symbols only');

const postalAddressSchema = z.object({
  city: z.string().trim().min(1, 'City is required').max(120),
  country: z.string().trim().min(1, 'Country is required').max(120),
  district: z.string().trim().min(1, 'District is required').max(120),
  province: z.string().trim().min(1, 'Province / state is required').max(120),
  zipCode: z.string().trim().min(1, 'ZIP / postal code is required').max(32),
});

export const registerSchema = z.object({
  address: postalAddressSchema,
  email: z.string().email().max(255),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8).max(128),
  otp: z.string().regex(/^\d{6}$/),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const verifyTfaLoginSchema = z.object({
  otp: z.string().min(6).max(10),
});

const cloudinaryHttpsImageUrl = z
  .string()
  .url()
  .max(2048)
  .refine(
    (u) => {
      try {
        const { hostname, protocol } = new URL(u);
        return protocol === 'https:' && hostname === 'res.cloudinary.com';
      } catch {
        return false;
      }
    },
    { message: 'Profile image must be a valid Cloudinary image URL' }
  );

const educationEntrySchema = z.object({
  degree: z.string().max(200).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
  field: z.string().max(200).optional(),
  institution: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  startYear: z.number().int().min(1900).max(2100).optional(),
});

const experienceEntrySchema = z.object({
  company: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  employmentType: z.string().max(80).optional(),
  endDate: z.string().max(40).optional(),
  location: z.string().max(200).optional(),
  startDate: z.string().max(40).optional(),
  title: z.string().max(200).optional(),
});

const businessDetailsSchema = z.object({
  companyName: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  industry: z.string().max(120).optional(),
  role: z.string().max(120).optional(),
  website: z.string().max(500).optional(),
});

const postalAddressOptionalSchema = z.object({
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  province: z.string().trim().max(120).optional(),
  zipCode: z.string().trim().max(32).optional(),
});

const socialLinkSchema = z.object({
  platform: z.string().trim().max(40),
  url: z.string().trim().max(500),
});

export const updateProfileSchema = z.object({
  address: postalAddressOptionalSchema.optional(),
  bio: z.string().max(2000).optional(),
  businessDetails: businessDetailsSchema.optional(),
  education: z.array(educationEntrySchema).max(25).optional(),
  experience: z.array(experienceEntrySchema).max(40).optional(),
  gender: z.enum(['', 'female', 'male', 'non_binary', 'other', 'prefer_not_say']).optional(),
  imageUrl: z.union([cloudinaryHttpsImageUrl, z.null()]).optional(),
  name: z.string().min(1).max(120).optional(),
  phone: phoneSchema.optional(),
  socialLinks: z.array(socialLinkSchema).max(20).optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

export const tfaDisableSchema = z.object({
  otp: z.string().min(6).max(10),
  password: z.string().min(1),
});

export const tfaVerifySetupSchema = z.object({
  otp: z.string().min(6).max(10),
});
