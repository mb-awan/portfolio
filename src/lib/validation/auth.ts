import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
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

export const updateProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  imageUrl: z.union([cloudinaryHttpsImageUrl, z.null()]).optional(),
  name: z.string().min(1).max(120).optional(),
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
