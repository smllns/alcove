import { z } from 'zod';
import { nameOf } from '../lib/validation.js';

export const listNameSchema = z.object({ name: nameOf('list') });
