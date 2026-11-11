import { z } from 'zod';
import { audiences, parts } from '../users/privacy.js';
import {
  currentPasswordField,
  emailField,
  newPasswordField,
  usernameField,
} from '../auth/schemas.js';

// Optional: left empty, it's cleared
export const nameSchema = z.object({
  name: z.string().trim().max(60, 'Keep it under 60 characters.'),
});

export const usernameSchema = z.object({ username: usernameField });

// Optional: left empty, it's cleared
export const aboutSchema = z.object({
  about: z.string().trim().max(300, 'Keep it under 300 characters.'),
});

// Their photo, one of their own uploads, or none
export const avatarSchema = z.object({ url: z.string().max(2000).nullable() });

// Who sees what of the reader's page: any of it changed at once
const audience = z.enum(audiences);
export const privacySchema = z
  .object({
    page: z.enum(['open', 'ask']).optional(),
    ...Object.fromEntries(parts.map((part) => [part, audience.optional()])),
  })
  .strict();

export const emailSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export const passwordSchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: newPasswordField,
});

export const deleteSchema = z.object({ password: currentPasswordField });
