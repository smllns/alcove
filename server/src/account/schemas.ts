import { z } from 'zod';
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

export const emailSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export const passwordSchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: newPasswordField,
});

export const deleteSchema = z.object({ password: currentPasswordField });
