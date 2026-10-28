import { z } from 'zod';

// Field rules, shared by sign-up and account settings

// Lowercase, and without the @ it's shown with, should it be typed too
export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .transform((name) => name.replace(/^@/, ''))
  .pipe(
    z
      .string()
      .regex(
        /^[a-z0-9_]{3,20}$/,
        'Use 3 to 20 letters, numbers or underscores.',
      ),
  );

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
  username: usernameField,
  email: emailField,
  password: newPasswordField,
});

export const loginSchema = z.object({
  email: emailField,
  password: currentPasswordField,
});
