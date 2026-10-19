import { z } from 'zod';
import {
  currentPasswordField,
  emailField,
  nameField,
  newPasswordField,
} from '../auth/schemas.js';

export const nameSchema = z.object({ name: nameField });

export const emailSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});

export const passwordSchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: newPasswordField,
});

export const deleteSchema = z.object({ password: currentPasswordField });
