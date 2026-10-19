import { z } from 'zod';

// Field rules, shared by sign-up and account settings
export const nameField = z
  .string()
  .trim()
  .min(1, 'Tell us what to call you.')
  .max(60, 'Keep it under 60 characters.');

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('That doesn’t look like an email address.'));

export const newPasswordField = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(200, 'That’s a little too long.');

export const currentPasswordField = z.string().min(1, 'Enter your password.');

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: newPasswordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});
