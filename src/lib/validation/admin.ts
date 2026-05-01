import { z } from 'zod';

const objectIdString = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

function intQuery(defaultValue: number, min: number, max: number): z.ZodType<number> {
  return z.union([z.string(), z.undefined()]).transform((v) => {
    if (v === undefined || v === '') {
      return defaultValue;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) {
      return defaultValue;
    }
    return Math.min(max, Math.max(min, Math.trunc(n)));
  });
}

export const adminListUsersQuerySchema = z.object({
  limit: intQuery(20, 1, 100),
  page: intQuery(1, 1, 10_000),
  q: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v ?? ''),
});

export const adminPatchUserSchema = z
  .object({
    emailVerified: z.boolean().optional(),
    name: z.string().min(1).max(120).optional(),
    roleId: z.union([objectIdString, z.literal(''), z.null()]).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { message: 'At least one field is required' });
