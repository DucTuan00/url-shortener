import { z } from 'zod';

export const createUrlSchema = z.object({
    url: z
        .string()
        .url('Invalid URL format')
        .max(2048, 'URL is too long'),
    customAlias: z
        .string()
        .min(3, 'Alias must be at least 3 characters')
        .max(50, 'Alias must be at most 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, hyphens, and underscores')
        .optional(),
    expiresAt: z
        .string()
        .datetime({ offset: true })
        .optional()
        .refine(
            (val) => !val || new Date(val) > new Date(),
            'Expiration date must be in the future'
        ),
});

export const updateUrlSchema = z.object({
    customAlias: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),
    expiresAt: z
        .string()
        .datetime({ offset: true })
        .nullable()
        .optional(),
    isActive: z.boolean().optional(),
});
